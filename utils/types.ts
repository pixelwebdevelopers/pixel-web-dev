import type * as THREE from 'three';

export type Vec3 = [number, number, number];

export type StationId =
  | 'hero'
  | 'services'
  | 'portfolio'
  | 'about'
  | 'process'
  | 'testimonials'
  | 'contact';

export interface Station {
  id: StationId;
  label: string;
  title: string;
  subtitle: string;
  position: Vec3;
  /** radius the car must enter to "arrive" at the station */
  radius: number;
  color: string;
}

export interface Service {
  id: string;
  title: string;
  short: string;
  description: string;
  features: string[];
  /** world position of the floating billboard */
  position: Vec3;
  color: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  category: 'web' | 'ecommerce' | 'mobile' | 'design';
  position: Vec3;
  problem: string;
  solution: string;
  tech: string[];
  results: { label: string; value: string }[];
  color: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export type CarControls = {
  forward: number; // 0..1
  backward: number; // 0..1
  left: number; // 0..1
  right: number; // 0..1
  brake: boolean; // handbrake
};

export interface CarTelemetry {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  speed: number;
  heading: number;
}
