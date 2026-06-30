const FEDERATION_ATLAS = {
  manifest: {
    schema_version: 'atlas-sandbox-v0.1',
    generated_utc: '2026-06-30T15:45:00Z',
    public_title: 'Ventus Global Grid 2050',
    strapline: 'Repository federation for an electrified future',
    key_law_status: 'UNPROVEN_ON_DECLARED_KEY',
    key_note: 'Current scan key passes on scanId|nodeId; declared repo_id contract remains unresolved.',
    unresolved_findings: ['homepage_governance_edges_present'],
    counts: { nodes: 16, edges: 35 }
  },
  statusColours: {
    green: '#00ff88',
    amber: '#ffcc00',
    red: '#ff3333',
    grey: '#888888',
    blue: '#3388ff'
  },
  groups: [
    {
      group: 'Federation Nodes',
      layers: [
        { id: 'repos_core', label: 'Core Repos', type: 'point', color: '#00ffff', source: 'nodes', filter: ['in', ['get', 'repo_type'], ['literal', ['data','ui','homepage','source_archive']]], preload: true, visible_default: true, minzoom: 0 },
        { id: 'repos_related', label: 'Related Repos', type: 'point', color: '#ffcc00', source: 'nodes', filter: ['==', ['get', 'repo_type'], 'unknown'], preload: true, visible_default: true, minzoom: 0 },
        { id: 'external_sources', label: 'External Sources', type: 'point', color: '#3388ff', source: 'nodes', filter: ['==', ['get', 'repo_type'], 'external'], preload: true, visible_default: true, minzoom: 0 }
      ]
    },
    {
      group: 'Relationships',
      layers: [
        { id: 'edge_data', label: 'Data Dependencies', type: 'line', color: '#66ccff', source: 'edges', filter: ['==', ['get', 'edge_type'], 'data'], preload: true, visible_default: true, minzoom: 0 },
        { id: 'edge_governance', label: 'Governance Flags', type: 'line', color: '#b47cff', source: 'edges', filter: ['==', ['get', 'edge_type'], 'governance'], preload: true, visible_default: true, minzoom: 0 },
        { id: 'edge_archive', label: 'Archive Lineage', type: 'line', color: '#527ca8', source: 'edges', filter: ['==', ['get', 'edge_type'], 'archive'], preload: true, visible_default: true, minzoom: 0 },
        { id: 'edge_external', label: 'External References', type: 'line', color: '#45536f', source: 'edges', filter: ['==', ['get', 'edge_type'], 'external'], preload: true, visible_default: false, minzoom: 0 },
        { id: 'edge_repo', label: 'Repo References', type: 'line', color: '#7f91b3', source: 'edges', filter: ['==', ['get', 'edge_type'], 'repo'], preload: true, visible_default: true, minzoom: 0 }
      ]
    }
  ],
  nodes: [
    { id:'Ventusltd/data-federation-map-for-globalgrid2050-all-repos', label:'data-federation-map-for-globalgrid2050-all-repos', repo_type:'data', status:'green', status_reason:'README + workflow present, active', url:'https://github.com/Ventusltd/data-federation-map-for-globalgrid2050-all-repos', importance_score:.98, coordinates:[-12,10] },
    { id:'Ventusltd/data-gb-electricity', label:'data-gb-electricity', repo_type:'data', status:'red', status_reason:'data repo contract finding shown from sandbox seed', url:'https://github.com/Ventusltd/data-gb-electricity', importance_score:.95, coordinates:[-55,22] },
    { id:'Ventusltd/data-interconnectors', label:'data-interconnectors', repo_type:'data', status:'red', status_reason:'data repo contract finding shown from sandbox seed', url:'https://github.com/Ventusltd/data-interconnectors', importance_score:.88, coordinates:[-55,-12] },
    { id:'Ventusltd/gb-electricity-ui', label:'gb-electricity-ui', repo_type:'ui', status:'red', status_reason:'UI shell depends on verified data repos', url:'https://github.com/Ventusltd/gb-electricity-ui', importance_score:.75, coordinates:[16,2] },
    { id:'Ventusltd/globalgrid2050', label:'globalgrid2050', repo_type:'source_archive', status:'blue', status_reason:'source archive / retiring monolith', url:'https://github.com/Ventusltd/globalgrid2050', importance_score:.82, coordinates:[64,2] },
    { id:'Ventusltd/globalgrid2050-hompage', label:'globalgrid2050-hompage', repo_type:'homepage', status:'green', status_reason:'temporary homepage dependency shown honestly', url:'https://github.com/Ventusltd/globalgrid2050-hompage', importance_score:.70, coordinates:[38,27] },
    { id:'Ventusltd/pandapower', label:'pandapower', repo_type:'unknown', status:'grey', status_reason:'not fully federated in current scan', url:'https://github.com/Ventusltd/pandapower', importance_score:.45, coordinates:[-95,-38] },
    { id:'Ventusltd/Podcast-transcripts', label:'Podcast-transcripts', repo_type:'unknown', status:'amber', status_reason:'no workflow detected', url:'https://github.com/Ventusltd/Podcast-transcripts', importance_score:.25, coordinates:[-92,45] },
    { id:'Ventusltd/pv-arc-protection-circuit', label:'pv-arc-protection-circuit', repo_type:'unknown', status:'amber', status_reason:'no workflow detected', url:'https://github.com/Ventusltd/pv-arc-protection-circuit', importance_score:.38, coordinates:[-26,55] },
    { id:'Ventusltd/Solar-PV-Hybrid-and-off-grid', label:'Solar-PV-Hybrid-and-off-grid', repo_type:'unknown', status:'amber', status_reason:'no workflow detected', url:'https://github.com/Ventusltd/Solar-PV-Hybrid-and-off-grid', importance_score:.22, coordinates:[-24,-54] },
    { id:'Ventusltd/solar-repowering-whitepaper', label:'solar-repowering-whitepaper', repo_type:'unknown', status:'amber', status_reason:'no workflow detected', url:'https://github.com/Ventusltd/solar-repowering-whitepaper', importance_score:.32, coordinates:[20,-50] },
    { id:'Ventusltd/youengineer-code-review', label:'youengineer-code-review', repo_type:'ui', status:'amber', status_reason:'reference UI pattern source', url:'https://github.com/Ventusltd/youengineer-code-review', importance_score:.56, coordinates:[50,-38] },
    { id:'DuckDB', label:'DuckDB', repo_type:'external', status:'blue', status_reason:'proof query engine', url:'', importance_score:.40, coordinates:[92,34] },
    { id:'Parquet', label:'Parquet', repo_type:'external', status:'blue', status_reason:'immutable columnar proof store', url:'', importance_score:.42, coordinates:[95,16] },
    { id:'Elexon BMRS API', label:'Elexon BMRS API', repo_type:'external', status:'blue', status_reason:'external electricity data source', url:'', importance_score:.48, coordinates:[108,-4] },
    { id:'GitHub Actions', label:'GitHub Actions', repo_type:'external', status:'blue', status_reason:'static build and verification runner', url:'', importance_score:.50, coordinates:[88,-30] }
  ],
  edges: [
    [0,12,'external'],[0,13,'external'],[0,5,'governance'],[0,15,'external'],[0,14,'external'],
    [1,4,'archive'],[1,5,'governance'],[1,14,'external'],[1,15,'external'],[1,12,'external'],[1,13,'external'],
    [2,4,'archive'],[2,5,'governance'],[2,14,'external'],[2,13,'external'],[2,1,'repo'],[2,3,'repo'],[2,15,'external'],[2,12,'external'],
    [3,1,'data'],[3,2,'data'],[3,5,'governance'],[3,15,'external'],
    [4,14,'external'],[4,15,'external'],
    [5,14,'external'],[5,0,'data'],[5,1,'data'],[5,2,'data'],[5,3,'repo'],[5,4,'archive'],[5,12,'external'],[5,13,'external'],[5,15,'external'],
    [6,15,'external']
  ]
};
