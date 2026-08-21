import assert from 'assert';
import { isRankUp, shouldShowRankUpPopup, RankType } from '../src/lib/ranking/rankUpUtils';
import { getRankFromScore, UserRankingData } from '../src/lib/ranking/rankUtils';

// A cópia local da lógica de preenchimento para teste do comportamento esperado
function getProcessedInitialDataForTest(
  data: UserRankingData[],
  devEnabled: boolean,
  devScore: number
): UserRankingData[] {
  if (devEnabled && Array.isArray(data)) {
    const dataCopy = JSON.parse(JSON.stringify(data)) as UserRankingData[];
    const currentUser = dataCopy.find((u: any) => u.isCurrentUser);
    if (currentUser) {
      currentUser.score = devScore;
      currentUser.rank = getRankFromScore(devScore);
      
      // Re-ordena o array para que a posição fique correta
      dataCopy.sort((a: any, b: any) => b.score - a.score);
      dataCopy.forEach((u: any, index: number) => {
        u.position = index + 1;
      });
    }
    return dataCopy;
  }
  return data;
}

function testRankUpComparison() {
  console.log('🔄 Iniciando teste de comparação de subida de ranking...');

  // Casos válidos de subida
  assert.strictEqual(isRankUp('Bronze', 'Prata'), true, 'Bronze para Prata deve ser subida');
  assert.strictEqual(isRankUp('Bronze', 'Ouro'), true, 'Bronze para Ouro deve ser subida');
  assert.strictEqual(isRankUp('Prata', 'Ouro'), true, 'Prata para Ouro deve ser subida');
  assert.strictEqual(isRankUp('Ouro', 'Diamante'), true, 'Ouro para Diamante deve ser subida');

  // Casos estáveis (sem subida)
  assert.strictEqual(isRankUp('Bronze', 'Bronze'), false, 'Bronze para Bronze não é subida');
  assert.strictEqual(isRankUp('Prata', 'Prata'), false, 'Prata para Prata não é subida');
  assert.strictEqual(isRankUp('Diamante', 'Diamante'), false, 'Diamante para Diamante não é subida');

  // Casos de queda (demotados)
  assert.strictEqual(isRankUp('Diamante', 'Ouro'), false, 'Diamante para Ouro não é subida (queda)');
  assert.strictEqual(isRankUp('Ouro', 'Prata'), false, 'Ouro para Prata não é subida (queda)');
  assert.strictEqual(isRankUp('Prata', 'Bronze'), false, 'Prata para Bronze não é subida (queda)');

  console.log('✅ Teste de comparação de ranking concluído com sucesso!');
}

function testPopupSuppressionByRoute() {
  console.log('🔄 Iniciando teste de supressão de pop-up por rota...');

  // Rotas onde o pop-up NÃO deve aparecer (tela de simulação ativa)
  assert.strictEqual(shouldShowRankUpPopup('/simulation/fuvest'), false, 'Deve suprimir em /simulation/fuvest');
  assert.strictEqual(shouldShowRankUpPopup('/simulation/enem'), false, 'Deve suprimir em /simulation/enem');
  assert.strictEqual(shouldShowRankUpPopup('/simulation/unicamp'), false, 'Deve suprimir em /simulation/unicamp');

  // Rotas normais onde o pop-up DEVE aparecer
  assert.strictEqual(shouldShowRankUpPopup('/simulation/fuvest/summary'), true, 'Deve exibir em /simulation/fuvest/summary');
  assert.strictEqual(shouldShowRankUpPopup('/profile'), true, 'Deve exibir em /profile');
  assert.strictEqual(shouldShowRankUpPopup('/ranking'), true, 'Deve exibir em /ranking');
  assert.strictEqual(shouldShowRankUpPopup('/'), true, 'Deve exibir na Home');

  console.log('✅ Teste de supressão por rota concluído com sucesso!');
}

function testPromotionAndDemotionLogic() {
  console.log('🔄 Iniciando teste de classificação de promoção e rebaixamento...');

  // Helper local para classificar
  const classifyTransition = (oldRank: RankType, newRank: RankType) => {
    if (oldRank === newRank) return 'stable';
    return isRankUp(oldRank, newRank) ? 'promotion' : 'demotion';
  };

  assert.strictEqual(classifyTransition('Bronze', 'Prata'), 'promotion', 'Bronze para Prata deve ser promoção');
  assert.strictEqual(classifyTransition('Ouro', 'Diamante'), 'promotion', 'Ouro para Diamante deve ser promoção');
  assert.strictEqual(classifyTransition('Diamante', 'Ouro'), 'demotion', 'Diamante para Ouro deve ser rebaixamento');
  assert.strictEqual(classifyTransition('Prata', 'Bronze'), 'demotion', 'Prata para Bronze deve ser rebaixamento');
  assert.strictEqual(classifyTransition('Ouro', 'Ouro'), 'stable', 'Ouro para Ouro deve ser estável');

  console.log('✅ Teste de classificação de transição concluído com sucesso!');
}

function testDevConfigMocking() {
  console.log('🔄 Iniciando teste de mock de DEV_CONFIG e ordenação...');

  const mockUsers: UserRankingData[] = [
    { position: 1, name: 'Alice', score: 3000, rank: 'Ouro' },
    { position: 2, name: 'Bob', score: 2000, rank: 'Prata', isCurrentUser: true },
    { position: 3, name: 'Charlie', score: 1000, rank: 'Prata' }
  ];

  // Caso 1: Mock Desabilitado
  const resultDisabled = getProcessedInitialDataForTest(mockUsers, false, 4500);
  assert.strictEqual(resultDisabled[1].score, 2000, 'Score de Bob não deve mudar se mock estiver desativado');
  assert.strictEqual(resultDisabled[1].position, 2, 'Posição de Bob não deve mudar se mock estiver desativado');

  // Caso 2: Mock Habilitado (Bob pontua 4500 -> Ouro e passa para a posição 1)
  const resultEnabled = getProcessedInitialDataForTest(mockUsers, true, 4500);
  const updatedBob = resultEnabled.find(u => u.name === 'Bob');
  assert.ok(updatedBob, 'Bob deve existir no resultado');
  assert.strictEqual(updatedBob!.score, 4500, 'Bob deve ter score 4500');
  assert.strictEqual(updatedBob!.rank, 'Ouro', 'Bob deve estar na liga Ouro');
  assert.strictEqual(updatedBob!.position, 1, 'Bob deve subir para a posição 1');

  // Caso 3: Mock Habilitado (Bob pontua 500 -> Bronze e cai para a posição 3)
  const resultEnabledDown = getProcessedInitialDataForTest(mockUsers, true, 500);
  const updatedBobDown = resultEnabledDown.find(u => u.name === 'Bob');
  assert.ok(updatedBobDown, 'Bob deve existir no resultado');
  assert.strictEqual(updatedBobDown!.score, 500, 'Bob deve ter score 500');
  assert.strictEqual(updatedBobDown!.rank, 'Bronze', 'Bob deve estar na liga Bronze');
  assert.strictEqual(updatedBobDown!.position, 3, 'Bob deve descer para a posição 3');

  console.log('✅ Teste de mock de DEV_CONFIG e ordenação concluído com sucesso!');
}

async function runTests() {
  try {
    testRankUpComparison();
    testPopupSuppressionByRoute();
    testPromotionAndDemotionLogic();
    testDevConfigMocking();
    console.log('\n🎉 Todos os testes de ranking passaram com sucesso!');
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

runTests();

