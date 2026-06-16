import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, categoryColors } from '../theme';
import { getCategoryBySlug, categoryHasVisualizations } from '../data/allCategories';
import { TabStackParamList } from '../navigation';
import CardsTab from '../components/CardsTab';
import QuizTab from '../components/QuizTab';
import VisualizeTab from '../components/VisualizeTab';
import LearnTab from '../components/LearnTab';
import UpgradeModal from '../components/UpgradeModal';
import { useSubscriptionContext } from '../context/SubscriptionContext';

const { width } = Dimensions.get('window');

// Inner padding of the segmented control; shared by the container style and
// the sliding-pill geometry so the indicator lines up with each tab.
const TAB_BAR_PADDING = spacing.xs;

type CategoryRouteProp = RouteProp<TabStackParamList, 'Category'>;

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Layers': 'layers-outline',
  'GitCompare': 'git-compare-outline',
  'Rabbit': 'flash-outline',
  'GitMerge': 'git-merge-outline',
  'RefreshCw': 'refresh-outline',
  'Undo2': 'arrow-undo-outline',
  'Network': 'git-network-outline',
  'TreeDeciduous': 'leaf-outline',
  'Triangle': 'triangle-outline',
  'Boxes': 'cube-outline',
  'Search': 'search-outline',
  'Trophy': 'trophy-outline',
  'Combine': 'git-pull-request-outline',
  'GitGraph': 'git-branch-outline',
  'Server': 'server-outline',
  'Globe': 'globe-outline',
  'Smartphone': 'phone-portrait-outline',
  'TabletSmartphone': 'tablet-portrait-outline',
  'Code-slash': 'code-slash-outline',
  'GitBranch': 'git-branch-outline',
  'Archive': 'archive-outline',
  'BarChart': 'bar-chart-outline',
  // Direct Ionicons mappings for new categories
  'logo-apple': 'phone-portrait-outline',
  'logo-android': 'tablet-portrait-outline',
  'phone-portrait-outline': 'phone-portrait-outline',
  'code-outline': 'code-outline',
  'infinite-outline': 'infinite-outline',
  'layers-outline': 'layers-outline',
  'color-wand-outline': 'color-wand-outline',
  'git-branch-outline': 'git-branch-outline',
  'construct-outline': 'construct-outline',
  'cloud-download-outline': 'cloud-download-outline',
  'refresh-outline': 'refresh-outline',
  'code-slash-outline': 'code-slash-outline',
  'speedometer-outline': 'speedometer-outline',
  'server-outline': 'server-outline',
  'hardware-chip-outline': 'hardware-chip-outline',
  'flash-outline': 'flash-outline',
  'swap-horizontal-outline': 'swap-horizontal-outline',
  'chatbubbles-outline': 'chatbubbles-outline',
  'shield-checkmark-outline': 'shield-checkmark-outline',
  'git-merge-outline': 'git-merge-outline',
  'bar-chart-outline': 'bar-chart-outline',
  'analytics-outline': 'analytics-outline',
};

type TabType = 'learn' | 'visualize' | 'cards' | 'quiz';

const baseTabs: { id: TabType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'learn', label: 'Learn', icon: 'book-outline' },
  { id: 'visualize', label: 'Visualize', icon: 'analytics-outline' },
  { id: 'cards', label: 'Cards', icon: 'copy-outline' },
  { id: 'quiz', label: 'Quiz', icon: 'bulb-outline' },
];

export default function CategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute<CategoryRouteProp>();
  const { slug } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const { isSubscribed } = useSubscriptionContext();
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  const category = getCategoryBySlug(slug);
  const isLocked = category?.premium && !isSubscribed;

  // Show upgrade modal immediately if locked
  useEffect(() => {
    if (isLocked) {
      setUpgradeModalVisible(true);
    }
  }, [isLocked]);

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Category not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catColors = categoryColors[category.id] || { color: colors.primary, dark: colors.primaryDark };
  const hasVisualizations = categoryHasVisualizations(category);
  const tabs = hasVisualizations ? baseTabs : baseTabs.filter(t => t.id !== 'visualize');

  // Sliding selection pill. We measure the segmented control once it lays out,
  // split the inner width evenly across the tabs (they're all flex: 1), and
  // spring an absolutely-positioned indicator to the active segment so the
  // highlight glides between tabs instead of snapping.
  const activeIndex = Math.max(0, tabs.findIndex(t => t.id === activeTab));
  const [barSize, setBarSize] = useState({ width: 0, height: 0 });
  const segmentWidth = barSize.width > 0 ? (barSize.width - TAB_BAR_PADDING * 2) / tabs.length : 0;
  const pillHeight = barSize.height > 0 ? barSize.height - TAB_BAR_PADDING * 2 : 0;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    indicatorX.value = withSpring(activeIndex * segmentWidth, {
      damping: 20,
      stiffness: 200,
      mass: 0.7,
    });
  }, [activeIndex, segmentWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={[styles.categoryIcon, { backgroundColor: `${catColors.color}20` }]}>
            <Ionicons
              name={iconMap[category.icon] || 'help-outline'}
              size={32}
              color={catColors.color}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>
              {category.description}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Tabs */}
      <Animated.View
        entering={FadeInDown.delay(200)}
        style={styles.tabsContainer}
        onLayout={(e) =>
          setBarSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
      >
        {segmentWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.tabIndicator,
              {
                width: segmentWidth,
                height: pillHeight,
                borderColor: catColors.color,
              },
              indicatorStyle,
            ]}
          />
        )}
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? catColors.color : colors.inkLight}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && { color: catColors.color },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'learn' && <LearnTab category={category} catColors={catColors} />}
        {activeTab === 'visualize' && <VisualizeTab category={category} catColors={catColors} />}
        {activeTab === 'cards' && <CardsTab category={category} catColors={catColors} />}
        {activeTab === 'quiz' && <QuizTab category={category} catColors={catColors} />}
      </View>

      {/* Upgrade Modal for locked content */}
      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={() => {
          setUpgradeModalVisible(false);
          // If still locked after closing modal, go back
          if (isLocked) {
            navigation.goBack();
          }
        }}
        categoryName={category.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...typography.headlineMedium,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backArrow: {
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  categoryName: {
    ...typography.displaySmall,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    ...typography.bodyMedium,
    color: colors.inkLight,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: TAB_BAR_PADDING,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  tabIndicator: {
    position: 'absolute',
    left: TAB_BAR_PADDING,
    top: TAB_BAR_PADDING,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
  },
  tabText: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  tabContent: {
    flex: 1,
  },
});
