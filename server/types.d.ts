export type ResultItem = {
  url: string,
  highlight: string,
  index: string,
  excerpt: string,
  title: string,
  lang: string,
  hostname: string,
};

export type ResultGrouped = ResultItem & {
  subItems: ResultItem[];
};

export type Facet = {
  name: string;
  data: Array<{ count: number; value: string }>;
};

export type Env = Record<string, string>
