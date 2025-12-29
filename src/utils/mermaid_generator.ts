export function generateEmptyLineageDiagram(
  datasetId: string,
  tableId: string,
  message: string
): string {
  return `graph LR
  Current["${datasetId}.${tableId}"]:::current
  Note["${message}"]:::note
  Note -.-> Current
  classDef current fill:#f9f,stroke:#333,stroke-width:4px
  classDef note fill:#fff,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5`;
}

