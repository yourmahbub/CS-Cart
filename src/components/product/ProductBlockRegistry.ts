import React from 'react';
import { BlockType } from '../../types/template';

export const ProductBlockRegistry: Record<BlockType, React.FC<any>> = {} as any;

export function registerBlock(type: BlockType, Component: React.FC<any>) {
  ProductBlockRegistry[type] = Component;
}
