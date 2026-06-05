export interface Dataset {
  id: number;
  name: string;
  description: string;
  type: 'Tabular' | 'Image' | 'Text' | 'Audio';
  rows: number;
  features: number;
  status: 'Not Explored' | 'Exploring' | 'Ready for Training' | 'Trained';
}

export interface DatasetCreate {
  name: string;
  description: string;
  type: string;
  rows: number;
  features: number;
  status: string;
}

export interface DatasetUpdate {
  description?: string;
  type?: string;
  rows?: number;
  features?: number;
  status?: string;
}

export interface Stats {
  total: number;
  tabular: number;
  image: number;
  text: number;
  audio: number;
}
