import { dbNexo, Desafio } from '../lib/NexoData';

// Structure of the data we will save
interface GameState {
    categoriasEmJogo: Desafio[];
    palavrasNoGrid: string[]; // Order of words currently on screen
    categoriasDescobertas: Desafio[]; // Groups already found
    erros: number;
    tentativas: number;
    isGameOver: boolean;
    vitoria: boolean | null; // null if game is ongoing
    dicaDisponivel: boolean;
    mapaGradientes: [string, string][]; // Maps are not serializable, we save as array of tuples
}

export class ConnectionsGame {
    // Game State
    private botoesEPalavras: Map<HTMLButtonElement, string> = new Map();
    private botoesSelecionados: HTMLButtonElement[] = [];
    private tentativas: number = 0;
    private erros: number = 0; 
    private bloqueado: boolean = false;
    private isGameOver: boolean = false;
    
    private categoriasEmJogo: Desafio[] = [];
    private categoriasDescobertas: Desafio[] = []; // New property to track progress
    
    private mapaGradientes: Map<string, string> = new Map();

    // DOM Elements
    private slots: NodeListOf<HTMLButtonElement>;
    private coracoesEl: NodeListOf<SVGElement>;
    private acertosContainer: HTMLElement | null;
    private btnDica: HTMLElement | null;
    private toastEl: HTMLElement | null = null;

    public onGameOver: ((vitoria: boolean, dados: { titulo: string; palavras: string[]; cor: string }[]) => void) | null = null;
    public onShake: ((botoes: HTMLButtonElement[]) => void) | null = null;
    public onSuccess: ((botoes: HTMLButtonElement[], categoria: Desafio) => void) | null = null;
    public onShuffle: ((shuffling: boolean) => void) | null = null;

    constructor() {
        this.slots = document.querySelectorAll(".game button");
        this.acertosContainer = document.querySelector(".acertos");
        this.btnDica = document.getElementById("nexo-dica-btn");
        this.coracoesEl = document.querySelectorAll("#nexo-lifes .nexo-heart");
        
        this.resetarInterfaceExterna();

        if (!this.slots.length) {
            console.warn("NexoLogic: Botões não encontrados na inicialização imediata.");
        }
        
        if (this.btnDica) {
            this.btnDica.onclick = () => this.usarDica();
        }
        this.criarElementoToast();

        // CHANGED: Try to load game first, otherwise start new
        if (!this.carregarJogo()) {
            this.iniciarJogo();
        }
    }

    // --- LOCAL STORAGE LOGIC ---

    private salvarJogo(): void {
        // 1. Get current words on grid in order
        const palavrasNoGrid: string[] = [];
        this.slots.forEach(btn => {
            // Only save if button is visible (not removed)
            if (document.body.contains(btn) && btn.style.display !== 'none') {
                const p = this.botoesEPalavras.get(btn);
                if (p) palavrasNoGrid.push(p);
            }
        });

        const state: GameState = {
            categoriasEmJogo: this.categoriasEmJogo,
            palavrasNoGrid: palavrasNoGrid,
            categoriasDescobertas: this.categoriasDescobertas,
            erros: this.erros,
            tentativas: this.tentativas,
            isGameOver: this.isGameOver,
            vitoria: this.isGameOver ? (this.erros < 10) : null,
            dicaDisponivel: this.btnDica ? !this.btnDica.classList.contains("hidden") : false,
            // Convert Map to Array for JSON serialization
            mapaGradientes: Array.from(this.mapaGradientes.entries()) 
        };

        localStorage.setItem("nexo_save_v1", JSON.stringify(state));
    }

    private carregarJogo(): boolean {
        const saveRaw = localStorage.getItem("nexo_save_v1");
        if (!saveRaw) return false;

        try {
            const state: GameState = JSON.parse(saveRaw);
            
            // Restore basic stats
            this.categoriasEmJogo = state.categoriasEmJogo;
            this.categoriasDescobertas = state.categoriasDescobertas || [];
            this.erros = state.erros;
            this.tentativas = state.tentativas;
            this.isGameOver = state.isGameOver;
            this.mapaGradientes = new Map(state.mapaGradientes);

            // 1. Restore Hearts (Lives)
          this.coracoesEl.forEach((heart, i) => {
             // Hearts are index 0 to 9. We lose hearts from the end (9, 8...)
             // Total lives = 10. Erros = 2. Lives left = 8.
             // We should set 'lost' on hearts from index (10 - 2 = 8) to 9.
             if (i >= (10 - this.erros)) {
                 heart.classList.remove("full");
                 heart.classList.add("lost");
             } else {
                 heart.classList.add("full");
                 heart.classList.remove("lost");
             }
          });

            // 2. Restore Hint Button
            if (this.btnDica) {
                if (state.dicaDisponivel) {
                    this.btnDica.classList.remove("hidden");
                } else {
                    this.btnDica.classList.add("hidden");
                }
            }

            // 3. Restore Found Categories (The colored bars)
            this.categoriasDescobertas.forEach(cat => {
                this.renderizarBarraAcerto(cat);
            });

            // 4. Restore Grid Words
            // We need to hide buttons that are no longer needed (because words were found)
            // and populate the remaining ones with the saved words.
            
            const wordsToRender = state.palavrasNoGrid;

            this.slots.forEach((btn, index) => {
                if (index < wordsToRender.length) {
                    // Populate button
                    const palavra = wordsToRender[index];
                    btn.textContent = palavra;
                    this.botoesEPalavras.set(btn, palavra);
                    
                    // Reset visuals
                    btn.classList.remove("selected", "errado", "dica-visual");
                    btn.classList.add("nexo-card", "default");
                    btn.style.display = ''; // Ensure visible
                    
                    btn.onclick = null; 
                    btn.onclick = () => this.apertou(btn);
                } else {
                    // Mantendo consistência com display:none em vez de remove()
                    btn.style.display = 'none'; 
                }
            });

            // 5. Check if game was already over when saved
            if (state.isGameOver && state.vitoria !== null) {
                // We delay slightly to let React mount, then show result
                setTimeout(() => {
                    this.finalizarJogo(state.vitoria!);
                }, 500);
            }

            return true;
        } catch (e) {
            console.error("Erro ao carregar save:", e);
            localStorage.removeItem("nexo_save_v1");
            return false;
        }
    }

    // --- STANDARD METHODS (Updated with salvarJogo) ---

    private resetarInterfaceExterna() {
        if (this.acertosContainer) this.acertosContainer.innerHTML = '';
        this.coracoesEl.forEach(heart => {
            heart.classList.remove("lost");
            heart.classList.add("full");
        });
        if (this.btnDica) {
            this.btnDica.classList.add("hidden");
            this.btnDica.classList.remove("fade-in-bttn");
        }
    }

    private creatingToastElementHelper() { /* ... existing helper ... */ } 
    // (Keep your criarElementoToast / mostrarAviso logic here exactly as before)
    
    private criarElementoToast(): void {
        if (!document.querySelector('.nexo-toast')) {
            this.toastEl = document.createElement('div');
            this.toastEl.classList.add('nexo-toast');
            this.toastEl.textContent = "Por uma!";
            const gameWindow = document.querySelector('.game')?.closest('.w-full.max-w-3xl');
            if (gameWindow) {
                (gameWindow as HTMLElement).style.position = 'relative'; 
                gameWindow.appendChild(this.toastEl);
            }
        } else {
            this.toastEl = document.querySelector('.nexo-toast');
        }
    }

    private mostrarAviso(): void {
        if (this.toastEl) {
            this.toastEl.classList.add('visible');
            setTimeout(() => { if (this.toastEl) this.toastEl.classList.remove('visible'); }, 2000);
        }
    }

    private iniciarJogo(): void {
        // ... (Keep your exact initializing logic here) ...
        // ... (Select subjects, gradients, words) ...
        
        // 1. Matérias logic
        const materiasDisponiveis = [...dbNexo];
        for (let i = materiasDisponiveis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [materiasDisponiveis[i], materiasDisponiveis[j]] = [materiasDisponiveis[j], materiasDisponiveis[i]];
        }
        const materiasSelecionadas = materiasDisponiveis.slice(0, 4);

        this.categoriasEmJogo = [];
        this.categoriasDescobertas = []; // Reset discovered
        this.mapaGradientes.clear();

        materiasSelecionadas.forEach(materia => {
            const randomIndex = Math.floor(Math.random() * materia.cards.length);
            const cardSelecionado = materia.cards[randomIndex];
            this.categoriasEmJogo.push(cardSelecionado);
            this.mapaGradientes.set(cardSelecionado.titulo, materia.corTema.claro);
        });

        const palavrasDoJogo = this.categoriasEmJogo.flatMap(cat => cat.palavras);

        for (let i = palavrasDoJogo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [palavrasDoJogo[i], palavrasDoJogo[j]] = [palavrasDoJogo[j], palavrasDoJogo[i]];
        }

        this.slots.forEach((botao, index) => {
            const palavra = palavrasDoJogo[index];
            botao.textContent = palavra;
            this.botoesEPalavras.set(botao, palavra);

            botao.classList.remove("selected", "errado", "dica-visual");
            botao.classList.add("nexo-card", "default");
            
            botao.onclick = null; 
            botao.onclick = () => this.apertou(botao);
        });

        // NEW: Save initial state
        this.salvarJogo();
    }

    public usarDica(): void {
        if (this.bloqueado) return;
        this.desmarcarTudo();

        // Filtra botões que estão visíveis e no DOM
        const botoesDisponiveis = Array.from(this.slots).filter(btn => 
            btn.style.display !== 'none' && document.body.contains(btn)
        ) as HTMLButtonElement[];

        if (botoesDisponiveis.length === 0) return;

        // Tenta encontrar um par de um grupo que ainda não foi totalmente resolvido
        const palavraBase = this.botoesEPalavras.get(botoesDisponiveis[0]);
        const gabaritoEncontrado = this.categoriasEmJogo.find(grupo => 
            grupo.palavras.includes(palavraBase!)
        );

        if (!gabaritoEncontrado) return;

        const botoesDoGrupo = botoesDisponiveis.filter(btn => 
            gabaritoEncontrado.palavras.includes(this.botoesEPalavras.get(btn)!)
        );

        // Marca um par (2 botões) para ajudar sem entregar o jogo todo
        const parDica = botoesDoGrupo.slice(0, 2);
        parDica.forEach(btn => {
            btn.classList.remove("default", "errado");
            btn.classList.add("dica-visual");
        });

        // Esconde o botão após o uso
        if (this.btnDica) {
            this.btnDica.classList.remove("fade-in-bttn");
            this.btnDica.classList.add("hidden");
        }
        
        // Save after using hint
        this.salvarJogo();
    }

    public desmarcarTudo(): void {
        if (this.bloqueado) return;
        this.botoesSelecionados.forEach(botao => {
            botao.classList.remove("selected");
            if (!botao.classList.contains("dica-visual")) {
                botao.classList.add("default");
            }
        });
        this.botoesSelecionados = [];
    }

    public embaralhar(): void {
        if (this.bloqueado) return;
        this.bloqueado = true;

        if (this.onShuffle) this.onShuffle(true);

        const container = document.querySelector(".game");
        if (!container) return;

        const botoesAtuais = Array.from(container.children) as HTMLElement[];
        if (botoesAtuais.length < 2) {
            this.bloqueado = false;
            return;
        }

        // ... (Keep existing visual shuffle logic) ...
        const rectContainer = container.getBoundingClientRect();
        const centroX = rectContainer.width / 2;
        const centroY = rectContainer.height / 2;

        const atualizarCoords = () => {
            botoesAtuais.forEach(botao => {
                const rect = botao.getBoundingClientRect();
                const x = (rect.left - rectContainer.left) + (rect.width / 2);
                const y = (rect.top - rectContainer.top) + (rect.height / 2);
                botao.style.setProperty('--tx', `${centroX - x}px`);
                botao.style.setProperty('--ty', `${centroY - y}px`);
            });
        };

        atualizarCoords();
        botoesAtuais.forEach(b => b.classList.add("embaralhando"));

        setTimeout(() => {
            for (let i = botoesAtuais.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [botoesAtuais[i], botoesAtuais[j]] = [botoesAtuais[j], botoesAtuais[i]];
            }
            botoesAtuais.forEach(b => container.appendChild(b));

            botoesAtuais.forEach(b => b.style.transition = 'none');
            atualizarCoords();
            container.getBoundingClientRect(); 

            requestAnimationFrame(() => {
                botoesAtuais.forEach(b => {
                    b.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    b.classList.remove("embaralhando");
                });
            });

            setTimeout(() => {
                botoesAtuais.forEach(b => {
                    b.style.transition = '';
                    b.style.removeProperty('--tx');
                    b.style.removeProperty('--ty');
                });
                this.bloqueado = false;
                
                if (this.onShuffle) this.onShuffle(false);
                
                // NEW: Save new order
                this.salvarJogo();
            }, 500);
        }, 500);
    }

    private apertou(botao: HTMLButtonElement): void {
        if (this.bloqueado) return;
        
        // ... (Keep existing selection logic) ...
        if (this.botoesSelecionados.includes(botao)) {
            this.botoesSelecionados = this.botoesSelecionados.filter(b => b !== botao);
            botao.classList.remove("selected");
            if (!botao.classList.contains("dica-visual")) {
                botao.classList.add("default");
            }
            return;
        }

        if (this.botoesSelecionados.length < 4) {
            if (!botao.classList.contains("dica-visual")) {
                botao.classList.remove("default");
            }
            botao.classList.add("selected");
            this.botoesSelecionados.push(botao);
        }

        if (this.botoesSelecionados.length === 4) {
            this.verificar();
        }
    }
    
    private verificar(): void {
        this.bloqueado = true;
        const palavrasSelecionadas = this.botoesSelecionados.map(b => this.botoesEPalavras.get(b)!);
        
        let acertoTotal = false;
        let categoriaDoAcerto: Desafio | undefined;

        for (const cat of this.categoriasEmJogo) {
            const todasEstaoNestaCategoria = palavrasSelecionadas.every(p => cat.palavras.includes(p));
            if (todasEstaoNestaCategoria) {
                acertoTotal = true;
                categoriaDoAcerto = cat;
                break; 
            }
        }

        if (acertoTotal && categoriaDoAcerto) {
            this.processarAcerto(categoriaDoAcerto);
        } else {
            this.verificarQuaseLa(palavrasSelecionadas);
            this.processarErro();
        }
    }
    
    private verificarQuaseLa(palavrasSelecionadas: string[]): void {
        // ... (Keep existing logic) ...
        for (const cat of this.categoriasEmJogo) {
            const acertosParciais = palavrasSelecionadas.filter(p => cat.palavras.includes(p)).length;
            if (acertosParciais === 3) {
                if (this.toastEl) this.toastEl.textContent = "Por uma!";
                this.mostrarAviso();
                return;
            }
        }
    }

    // Helper to render the bar (used by both Game and Load)
    private renderizarBarraAcerto(categoria: Desafio) {
        if (!this.acertosContainer) return;
        
        const div = document.createElement("div");
        const gradienteFundo = this.mapaGradientes.get(categoria.titulo);
        if (gradienteFundo) {
            div.style.background = gradienteFundo;
        }
        div.style.color = "#fff";

        const h2 = document.createElement("h2");
        const p = document.createElement("p");
        h2.textContent = categoria.titulo;
        p.textContent = categoria.palavras.join(", ");

        div.appendChild(h2);
        div.appendChild(p);
        this.acertosContainer.appendChild(div);
    }

    public processarAcerto(categoria: Desafio): void {
        // Update Internal State
        this.categoriasDescobertas.push(categoria);

        // Toca som de acerto
        try {
            const audio = new Audio('/accept.mp3');
            audio.volume = 0.7;
            audio.play().catch(() => {});
        } catch {}

        // Chama o callback de sucesso antes de esconder os botões
        if (this.onSuccess) {
            this.onSuccess([...this.botoesSelecionados], categoria);
        }

        // Aguarda a animação do Framer Motion terminar (1s para o salto e fade)
        setTimeout(() => {
            this.botoesSelecionados.forEach(botao => {
                botao.style.display = 'none';
                botao.classList.remove("selected", "errado");
            });
            this.botoesSelecionados = [];
            this.bloqueado = false;

            this.renderizarBarraAcerto(categoria);

            // Reativa a dica para o próximo grupo se o usuário ainda tiver muitos erros
            if (this.erros >= 5 && this.btnDica && !this.isGameOver) {
                this.btnDica.classList.remove("hidden");
                this.btnDica.classList.add("fade-in-bttn");
            }

            // Save Progress
            this.salvarJogo();

            // Check final: Garante que estamos olhando apenas para o que sobrou no grid
            const botoesVisiveis = Array.from(this.slots).filter(btn => 
                btn.style.display !== 'none'
            );
            
            if (botoesVisiveis.length === 0) {
                this.finalizarJogo(true);
            }
        }, 1000);
    }

    private processarErro(): void {
        this.erros++;
        this.tentativas++;

        // Toca som de erro
        try {
            const audio = new Audio('/error.mp3');
            audio.volume = 0.7;
            audio.play().catch(() => {});
        } catch {}

        const totalVidas = 10;
        const indiceParaRemover = totalVidas - this.erros;

        if (indiceParaRemover >= 0 && this.coracoesEl[indiceParaRemover]) {
            const coracao = this.coracoesEl[indiceParaRemover];
            coracao.classList.remove("full");
            coracao.classList.add("lost");
        }

        if (this.erros >= 5 && this.btnDica) {
            if (this.btnDica.classList.contains("hidden")) {
                this.btnDica.classList.remove("hidden");
                this.btnDica.classList.add("fade-in-bttn");
            }
        }

        // Chama o callback de shake com os botões selecionados
        if (this.onShake) {
            this.onShake(this.botoesSelecionados);
        }

        this.botoesSelecionados.forEach(botao => {
            botao.classList.add("errado");
        });

        this.salvarJogo();

        if (this.erros >= totalVidas) {
            this.isGameOver = true;
            this.salvarJogo();
            this.finalizarJogo(false);
        }

        setTimeout(() => {
            this.limparErro();
        }, 1000);
    }

    private limparErro(): void {
        this.botoesSelecionados.forEach(botao => {
            botao.classList.remove("errado", "selected");
            botao.classList.add("default");
        });
        this.botoesSelecionados = [];
        
        if (!this.isGameOver) {
            this.bloqueado = false;
        }
    }

    private finalizarJogo(vitoria: boolean): void {
        this.isGameOver = true;
        // Ensure state is saved as finished
        this.salvarJogo();

        if (this.onGameOver) {
            const resumo = this.categoriasEmJogo.map(cat => ({
                titulo: cat.titulo,
                palavras: cat.palavras,
                cor: this.mapaGradientes.get(cat.titulo) || '#ccc'
            }));

            setTimeout(() => {
                if (this.onGameOver) this.onGameOver(vitoria, resumo);
            }, 600);
        }
    }
}