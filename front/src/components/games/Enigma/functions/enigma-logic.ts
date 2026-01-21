import {
  Entity,
  entitiesBySubject,
  GuessFeedback,
  AttributeFeedback,
  FeedbackStatus
} from '../lib/enigma-data';

// =============================================================================
// LOGIC FUNCTIONS
// =============================================================================

export function getTargetEntityForDay(subjectId: string): Entity | null {
  const entities = entitiesBySubject[subjectId];
  if (!entities || entities.length === 0) return null;

  // Baseado na data atual, seleciona uma entidade determinística
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  // Garante que o índice sempre seja positivo e dentro do array
  const index = dayOfYear % entities.length;
  return entities[index];
}

export function getEntitiesForSubject(subjectId: string): Entity[] {
  return entitiesBySubject[subjectId] || [];
}

export function compareGuess(guess: Entity, target: Entity): GuessFeedback {
  const feedback: AttributeFeedback[] = [];
  const targetAttrs = target.attributes;
  const guessAttrs = guess.attributes;

  for (const key of Object.keys(targetAttrs)) {
    const targetValue = targetAttrs[key];
    const guessValue = guessAttrs[key];

    let status: FeedbackStatus = "incorrect";

    if (Array.isArray(targetValue) && Array.isArray(guessValue)) {
      // Comparação de arrays (listas)
      const intersection = guessValue.filter((v) => targetValue.includes(v));
      if (
        intersection.length === targetValue.length &&
        intersection.length === guessValue.length
      ) {
        status = "correct";
      } else if (intersection.length > 0) {
        status = "partial";
      } else {
        status = "incorrect";
      }
    } else if (typeof targetValue === "number" && typeof guessValue === "number") {
      // Comparação numérica
      if (guessValue === targetValue) {
        status = "correct";
      } else if (guessValue < targetValue) {
        status = "higher";
      } else {
        status = "lower";
      }
    } else {
      // Comparação de strings
      if (guessValue === targetValue) {
        status = "correct";
      } else {
        status = "incorrect";
      }
    }

    feedback.push({
      key,
      value: guessValue,
      status,
    });
  }

  const isCorrect = guess.id === target.id;

  return {
    entity: guess,
    feedback,
    isCorrect,
  };
}