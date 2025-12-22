// Declarações de tipo para importações de módulos não-TypeScript

// Arquivos CSS
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Arquivos de imagem
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

// Arquivos de áudio
declare module '*.mp3' {
  const value: string;
  export default value;
}

declare module '*.wav' {
  const value: string;
  export default value;
}

// Arquivos de vídeo
declare module '*.mp4' {
  const value: string;
  export default value;
}

// Fontes
declare module '*.otf' {
  const value: string;
  export default value;
}

declare module '*.ttf' {
  const value: string;
  export default value;
}

declare module '*.woff' {
  const value: string;
  export default value;
}

declare module '*.woff2' {
  const value: string;
  export default value;
}
