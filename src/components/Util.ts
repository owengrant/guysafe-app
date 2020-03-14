export interface Zone {
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
  _id: string;
}

export const DEFAULT_ZONE: Zone = {
  latitude: Number(),
  longitude: Number(),
  radius: Number(),
  name: String(),
  _id: String()
};
