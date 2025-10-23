export interface RelationField {
  connect?: { id: number }[];
  set?: { id: number }[];
  id?: number;
}

export interface MenuData {
  firstPlate?: RelationField | number | null;
  secondPlate?: RelationField | number | null;
  dessert?: RelationField | number | null;
  priceWithOutIVA?: number;
  priceIVA?: number;
  [key: string]: any;
}

export interface EventParams {
  data: MenuData;
  where?: { id?: number };
}

export interface Event {
  params: EventParams;
}


export interface Allergen {
  id: number | string;
  name: string;
}

export interface Plate {
  id: number | string;
  name: string;
  price?: number;
  allergen?: Allergen[];
}

export interface DailyMenu {
  id: number | string;
  price?: number;
  priceWithOutIVA?: number;
  priceIVA?: number;
  firstPlate?: Plate | null;
  secondPlate?: Plate | null;
  dessert?: Plate | null;
}

export interface PlateCount {
  id: number | string;
  name: string;
  count: number;
}

