import React from 'react';
import { render } from '@testing-library/react';
import { Check } from 'lucide-react';
import { cloneDeep } from 'lodash-es';

describe('ESM Import Test', () => {
  it('should import and use ESM modules correctly', () => {
    // Test lucide-react (ESM)
    const { container } = render(<Check />);
    expect(container.firstChild).toBeTruthy();
    
    // Test lodash-es (ESM)
    const obj = { a: { b: 2 } };
    const cloned = cloneDeep(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });
}); 