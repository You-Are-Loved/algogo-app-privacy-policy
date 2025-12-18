import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, FadeInRight } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '../theme';
import { Category } from '../types';
import { useStore } from '../store/useStore';

interface QuizTabProps {
  category: Category;
  catColors: { color: string; dark: string };
}

type QuizState = 'ready' | 'playing' | 'feedback' | 'results';

interface Answer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export default function QuizTab({ category, catColors }: QuizTabProps) {
  const [quizState, setQuizState] = useState<QuizState>('ready');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { completeQuiz, getCategoryProgress } = useStore();

  const progress = getCategoryProgress(category.id);
  const questions = category.quizQuestions;
  const question = questions[currentQuestion];

  const score = answers.filter((a) => a.isCorrect).length;
  const percentage = Math.round((score / questions.length) * 100);

  useEffect(() => {
    if (quizState === 'results') {
      completeQuiz(category.id, score, questions.length);
    }
  }, [quizState]);

  const handleStart = () => {
    setQuizState('playing');
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
  };

  const handleSelectAnswer = (index: number) => {
    if (quizState !== 'playing') return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.correctAnswer;

    setAnswers([
      ...answers,
      {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
      },
    ]);

    setQuizState('feedback');
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setQuizState('playing');
    } else {
      setQuizState('results');
    }
  };

  const getOptionStyle = (index: number) => {
    if (quizState === 'playing') {
      return selectedAnswer === index ? styles.optionSelected : {};
    }
    if (quizState === 'feedback') {
      if (index === question.correctAnswer) return styles.optionCorrect;
      if (index === selectedAnswer && index !== question.correctAnswer) return styles.optionIncorrect;
    }
    return {};
  };

  // Ready State
  if (quizState === 'ready') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <Animated.View entering={FadeInDown} style={styles.readyContent}>
          <View style={[styles.readyIcon, { backgroundColor: `${catColors.color}20` }]}>
            <Ionicons name="help-circle" size={48} color={catColors.color} />
          </View>
          <Text style={styles.readyTitle}>Ready to test yourself?</Text>
          <Text style={styles.readySubtitle}>
            {questions.length} questions about {category.name}
          </Text>

          {progress.quizHighScore > 0 && (
            <View style={styles.bestScore}>
              <Ionicons name="trophy" size={20} color={colors.accent} />
              <Text style={styles.bestScoreText}>Your best: {progress.quizHighScore}%</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: catColors.color }]}
            onPress={handleStart}
          >
            <Ionicons name="flash" size={20} color={colors.white} />
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    );
  }

  // Results State
  if (quizState === 'results') {
    const isPerfect = percentage === 100;
    const isGood = percentage >= 70;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <Animated.View entering={FadeInDown} style={styles.resultsContent}>
          <Animated.View
            entering={FadeIn.delay(200)}
            style={[
              styles.resultsCircle,
              isPerfect
                ? { backgroundColor: colors.accent }
                : isGood
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.secondary },
            ]}
          >
            {isPerfect ? (
              <Ionicons name="trophy" size={48} color={colors.white} />
            ) : (
              <Text style={styles.resultsPercent}>{percentage}%</Text>
            )}
          </Animated.View>

          <Text style={styles.resultsTitle}>
            {isPerfect ? 'Perfect Score!' : isGood ? 'Great Job!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultsSubtitle}>
            You got {score} out of {questions.length} correct
          </Text>

          {isPerfect && (
            <Animated.View entering={FadeIn.delay(400)} style={styles.bonusBadge}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
              <Text style={styles.bonusText}>+100 XP Bonus!</Text>
            </Animated.View>
          )}

          <View style={styles.answerSummary}>
            {answers.map((answer, index) => (
              <Animated.View
                key={answer.questionId}
                entering={FadeIn.delay(500 + index * 50)}
                style={[
                  styles.answerDot,
                  answer.isCorrect
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.error },
                ]}
              >
                <Ionicons
                  name={answer.isCorrect ? 'checkmark' : 'close'}
                  size={16}
                  color={colors.white}
                />
              </Animated.View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={handleStart}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.startButtonText}>Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    );
  }

  // Playing / Feedback State
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <Text style={styles.scoreText}>
            {score}/{answers.length} correct
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestion + 1) / questions.length) * 100}%`, backgroundColor: catColors.color },
            ]}
          />
        </View>
      </View>

      {/* Question */}
      <Animated.View entering={FadeInRight} style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.options}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.option, getOptionStyle(index)]}
              onPress={() => handleSelectAnswer(index)}
              disabled={quizState !== 'playing'}
            >
              <View
                style={[
                  styles.optionLetter,
                  selectedAnswer === index && quizState === 'playing' && { backgroundColor: colors.secondary },
                  quizState === 'feedback' && index === question.correctAnswer && { backgroundColor: colors.primary },
                  quizState === 'feedback' &&
                    index === selectedAnswer &&
                    index !== question.correctAnswer && { backgroundColor: colors.error },
                ]}
              >
                <Text
                  style={[
                    styles.optionLetterText,
                    (selectedAnswer === index || (quizState === 'feedback' && index === question.correctAnswer)) && {
                      color: colors.white,
                    },
                  ]}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={styles.optionText}>{option}</Text>
              {quizState === 'feedback' && index === question.correctAnswer && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
              {quizState === 'feedback' && index === selectedAnswer && index !== question.correctAnswer && (
                <Ionicons name="close-circle" size={20} color={colors.error} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Explanation */}
        {quizState === 'feedback' && (
          <Animated.View entering={FadeInDown} style={styles.explanation}>
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb" size={20} color={colors.secondary} />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Action Button */}
      {quizState === 'playing' ? (
        <TouchableOpacity
          style={[
            styles.actionButton,
            selectedAnswer !== null
              ? { backgroundColor: catColors.color }
              : { backgroundColor: colors.border },
          ]}
          onPress={handleSubmitAnswer}
          disabled={selectedAnswer === null}
        >
          <Text
            style={[
              styles.actionButtonText,
              selectedAnswer === null && { color: colors.inkLight },
            ]}
          >
            Check Answer
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.actionButtonText}>
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
          </Text>
          <Ionicons
            name={currentQuestion < questions.length - 1 ? 'chevron-forward' : 'trophy'}
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>
      )}

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyContent: {
    alignItems: 'center',
  },
  readyIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  readyTitle: {
    ...typography.headlineLarge,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  readySubtitle: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    marginBottom: spacing.xl,
  },
  bestScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.accent}15`,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: `${colors.accent}30`,
    marginBottom: spacing.xl,
  },
  bestScoreText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.lg,
  },
  startButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  resultsContent: {
    alignItems: 'center',
  },
  resultsCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  resultsPercent: {
    ...typography.displayLarge,
    color: colors.white,
  },
  resultsTitle: {
    ...typography.displaySmall,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  resultsSubtitle: {
    ...typography.bodyLarge,
    color: colors.inkLight,
    marginBottom: spacing.lg,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.accent}15`,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: `${colors.accent}30`,
    marginBottom: spacing.lg,
  },
  bonusText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
  answerSummary: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  answerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  scoreText: {
    ...typography.labelSmall,
    color: colors.inkLight,
  },
  progressBar: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  questionText: {
    ...typography.headlineMedium,
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}10`,
  },
  optionCorrect: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  optionIncorrect: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}15`,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  optionText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
  },
  explanation: {
    marginTop: spacing.lg,
    backgroundColor: `${colors.secondary}15`,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: `${colors.secondary}30`,
    padding: spacing.md,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  explanationTitle: {
    ...typography.labelLarge,
    color: colors.secondary,
  },
  explanationText: {
    ...typography.bodyMedium,
    color: colors.ink,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  actionButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
});
