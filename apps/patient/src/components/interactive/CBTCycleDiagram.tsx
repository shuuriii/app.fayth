import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, {
  Rect,
  Text as SvgText,
  Path,
  G,
  Defs,
  Marker,
  Polygon,
} from 'react-native-svg';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CBTCycleDiagramProps {
  mode: 'view' | 'edit';
  /** Values for edit mode -- keyed by node field ID */
  values?: Record<string, string>;
  /** Called when a field changes in edit mode */
  onChange?: (fieldId: string, value: string) => void;
  /** Content descriptions for view mode tooltips */
  contentBlocks?: Array<{ heading?: string; body?: string }>;
}

interface CycleNode {
  id: string;
  label: string;
  fieldId: string;
  /** Position within the 300x300 SVG viewport */
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const NODES: CycleNode[] = [
  { id: 'neuro', label: 'Neurological\nDifferences', fieldId: 'neuropsych_deficits', x: 150, y: 40 },
  { id: 'life', label: 'Life\nEvents', fieldId: 'life_events', x: 260, y: 120 },
  { id: 'thoughts', label: 'Thoughts', fieldId: 'negative_thoughts', x: 220, y: 240 },
  { id: 'feelings', label: 'Feelings', fieldId: 'negative_feelings', x: 80, y: 240 },
  { id: 'behaviours', label: 'Behaviours', fieldId: 'negative_behaviours', x: 40, y: 120 },
];

/** Positive-branch nodes shown in edit mode as a second row */
const POSITIVE_NODES: CycleNode[] = [
  { id: 'pos_reappraisal', label: 'Positive\nReappraisal', fieldId: 'positive_reappraisal', x: 0, y: 0 },
  { id: 'pos_thoughts', label: 'Positive\nThoughts', fieldId: 'positive_thoughts', x: 0, y: 0 },
];

const NODE_W = 60;
const NODE_H = 40;
const SVG_W = 300;
const SVG_H = 290;
const ARROW_ID = 'arrowhead';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a quadratic bezier curve between two node centres, bowing outward. */
function curvedPath(from: CycleNode, to: CycleNode): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;

  // Offset the control point away from the centre of the diagram
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const dx = mx - cx;
  const dy = my - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const bulge = 18;
  const qx = mx + (dx / dist) * bulge;
  const qy = my + (dy / dist) * bulge;

  return `M ${from.x} ${from.y} Q ${qx} ${qy} ${to.x} ${to.y}`;
}

/** Edges: 1->2->3->4->5->2 (the feedback loop skips back to Life Events) */
const EDGES: Array<[number, number]> = [
  [0, 1], // Neuro -> Life Events
  [1, 2], // Life Events -> Thoughts
  [2, 3], // Thoughts -> Feelings
  [3, 4], // Feelings -> Behaviours
  [4, 1], // Behaviours -> Life Events (loop)
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface NodeRectProps {
  node: CycleNode;
  isActive: boolean;
  isFilled: boolean;
  onPress: () => void;
}

function NodeRect({ node, isActive, isFilled, onPress }: NodeRectProps) {
  const fill = isActive ? Colors.primaryLight : Colors.surfaceAlt;
  const stroke = isActive ? Colors.primary : Colors.border;
  const textFill = isActive ? Colors.primaryDark : Colors.text;
  const lines = node.label.split('\n');

  return (
    <G onPress={onPress}>
      {/* Hit-area (invisible, larger than visible rect for easier tapping) */}
      <Rect
        x={node.x - NODE_W / 2 - 4}
        y={node.y - NODE_H / 2 - 4}
        width={NODE_W + 8}
        height={NODE_H + 8}
        fill="transparent"
      />
      {/* Visible rounded rect */}
      <Rect
        x={node.x - NODE_W / 2}
        y={node.y - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={Radii.md}
        ry={Radii.md}
        fill={fill}
        stroke={stroke}
        strokeWidth={isActive ? 2 : 1}
      />
      {/* Label */}
      {lines.map((line, i) => {
        const lineHeight = 13;
        const totalHeight = lines.length * lineHeight;
        const startY = node.y - totalHeight / 2 + lineHeight / 2 + i * lineHeight;
        return (
          <SvgText
            key={i}
            x={node.x}
            y={startY + 1}
            textAnchor="middle"
            alignmentBaseline="central"
            fontSize={FontSizes.xs - 1}
            fontWeight={isActive ? '600' : '400'}
            fill={textFill}
          >
            {line}
          </SvgText>
        );
      })}
      {/* Checkmark overlay when filled (edit mode) */}
      {isFilled && (
        <G>
          <Rect
            x={node.x + NODE_W / 2 - 14}
            y={node.y - NODE_H / 2 - 4}
            width={16}
            height={16}
            rx={8}
            fill={Colors.primary}
          />
          <SvgText
            x={node.x + NODE_W / 2 - 6}
            y={node.y - NODE_H / 2 + 5}
            textAnchor="middle"
            alignmentBaseline="central"
            fontSize={10}
            fill={Colors.textOnPrimary}
            fontWeight="700"
          >
            {'✓'}
          </SvgText>
        </G>
      )}
    </G>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CBTCycleDiagram({
  mode,
  values = {},
  onChange,
  contentBlocks = [],
}: CBTCycleDiagramProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animHeight = useRef(new Animated.Value(0)).current;

  // Animate detail panel in/out
  useEffect(() => {
    if (activeNodeId) {
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animHeight, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animOpacity.setValue(0);
      animHeight.setValue(0);
    }
  }, [activeNodeId, animOpacity, animHeight]);

  const handleNodePress = (nodeId: string) => {
    setActiveNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  const activeNode = NODES.find((n) => n.id === activeNodeId);
  const activeIndex = activeNode ? NODES.indexOf(activeNode) : -1;
  const activePositive = POSITIVE_NODES.find((n) => n.id === activeNodeId);

  // Determine if a node is "filled" in edit mode
  const isNodeFilled = (fieldId: string) => {
    const val = values[fieldId];
    return typeof val === 'string' && val.trim().length > 0;
  };

  // ── View-mode detail panel content ──
  const viewContent = activeIndex >= 0 && activeIndex < contentBlocks.length
    ? contentBlocks[activeIndex]
    : null;

  // ── Edit-mode active field ──
  const activeFieldId = activeNode?.fieldId ?? activePositive?.fieldId ?? null;
  const activeLabel = activeNode?.label.replace('\n', ' ') ?? activePositive?.label.replace('\n', ' ') ?? '';

  return (
    <View style={styles.container}>
      {/* ── SVG Diagram ── */}
      <View style={styles.svgWrapper}>
        <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          <Defs>
            <Marker
              id={ARROW_ID}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <Polygon points="0 0, 8 3, 0 6" fill={Colors.textTertiary} />
            </Marker>
          </Defs>

          {/* Edges */}
          {EDGES.map(([fromIdx, toIdx], i) => (
            <Path
              key={`edge-${i}`}
              d={curvedPath(NODES[fromIdx], NODES[toIdx])}
              stroke={Colors.textTertiary}
              strokeWidth={1.5}
              fill="none"
              markerEnd={`url(#${ARROW_ID})`}
            />
          ))}

          {/* Nodes */}
          {NODES.map((node) => (
            <NodeRect
              key={node.id}
              node={node}
              isActive={activeNodeId === node.id}
              isFilled={mode === 'edit' && isNodeFilled(node.fieldId)}
              onPress={() => handleNodePress(node.id)}
            />
          ))}

          {/* Centre hint when nothing selected */}
          {!activeNodeId && (
            <SvgText
              x={SVG_W / 2}
              y={SVG_H / 2 + 10}
              textAnchor="middle"
              fontSize={FontSizes.xs}
              fill={Colors.textTertiary}
            >
              Tap a part of the cycle
            </SvgText>
          )}
        </Svg>
      </View>

      {/* ── Positive branch row (edit mode only) ── */}
      {mode === 'edit' && (
        <View style={styles.positiveRow}>
          <Text style={styles.positiveLabel}>Positive pathway</Text>
          <View style={styles.positiveNodes}>
            {POSITIVE_NODES.map((pNode) => {
              const isActive = activeNodeId === pNode.id;
              const filled = isNodeFilled(pNode.fieldId);
              return (
                <Pressable
                  key={pNode.id}
                  onPress={() => handleNodePress(pNode.id)}
                  style={[
                    styles.positiveNode,
                    isActive && styles.positiveNodeActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={pNode.label.replace('\n', ' ')}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.positiveNodeText,
                      isActive && styles.positiveNodeTextActive,
                    ]}
                  >
                    {pNode.label.replace('\n', ' ')}
                  </Text>
                  {filled && <Text style={styles.checkBadge}>{'✓'}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Detail / Edit Panel ── */}
      {activeNodeId && (
        <Animated.View
          style={[
            styles.detailPanel,
            {
              opacity: animOpacity,
              maxHeight: animHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300],
              }),
            },
          ]}
        >
          {mode === 'view' && viewContent && (
            <View style={styles.viewContent}>
              {viewContent.heading && (
                <Text style={styles.viewHeading}>{viewContent.heading}</Text>
              )}
              {viewContent.body && (
                <Text style={styles.viewBody}>{viewContent.body}</Text>
              )}
            </View>
          )}

          {mode === 'view' && !viewContent && (
            <Text style={styles.viewBody}>
              No description available for this node.
            </Text>
          )}

          {mode === 'edit' && activeFieldId && (
            <View style={styles.editContent}>
              <Text style={styles.editLabel}>{activeLabel}</Text>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder={`Describe your ${activeLabel.toLowerCase()}...`}
                placeholderTextColor={Colors.textTertiary}
                value={values[activeFieldId] ?? ''}
                onChangeText={(text) => onChange?.(activeFieldId, text)}
                textAlignVertical="top"
                accessibilityLabel={`Enter your ${activeLabel.toLowerCase()}`}
              />
            </View>
          )}
        </Animated.View>
      )}

      {/* ── Instruction when nothing selected ── */}
      {!activeNodeId && (
        <Text style={styles.instruction}>
          {mode === 'view'
            ? 'Tap a part of the cycle to learn more'
            : 'Tap a part of the cycle to add your examples'}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  svgWrapper: {
    width: SVG_W,
    height: SVG_H,
  },

  // Positive branch row
  positiveRow: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  positiveLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  positiveNodes: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  positiveNode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positiveNodeActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  positiveNodeText: {
    fontSize: FontSizes.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  positiveNodeTextActive: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  checkBadge: {
    fontSize: 10,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '700',
  },

  // Detail / edit panel
  detailPanel: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  viewContent: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  viewHeading: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  viewBody: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  editContent: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  editLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    fontSize: FontSizes.sm,
    color: Colors.text,
    backgroundColor: Colors.surface,
    lineHeight: 20,
  },

  // Instruction
  instruction: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
