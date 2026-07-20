import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNode } from '../types'

export const StoryNodeComponent = memo(({ data, selected }: NodeProps<FlowNode>) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-surface min-w-50 max-w-75 ${selected ? 'border-violet-500 shadow-lg' : 'border-line'
        }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-violet-500!" />

      <div className="space-y-2">
        <h3 className="font-semibold text-white text-sm">{data.label}</h3>

        {data.timeline_order !== null && data.timeline_order !== undefined && (
          <div className="text-sm text-sea-ink-soft">
            Timeline: {data.timeline_order}
          </div>
        )}

        {data.location && (
          <div className="text-sm text-sea-ink-soft">
            📍 {data.location}
          </div>
        )}

        {data.summary && (
          <p className="text-sm text-sea-ink-soft line-clamp-3">{data.summary}</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-violet-500!" />
    </div>
  )
})

StoryNodeComponent.displayName = 'StoryNodeComponent'
