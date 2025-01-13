import {
  securityValidationRules,
  performanceValidationRules,
  dataQualityValidationRules,
  accessibilityValidationRules,
  enhancedRelationshipRules
} from '../validation-rules';
import { generateAutoFixes, applyAutoFixes } from '../auto-fix';

describe('Security Validation Rules', () => {
  describe('Password Validation', () => {
    const passwordRule = securityValidationRules.find(r => r.field === 'password')!;

    it('accepts strong passwords', () => {
      expect(passwordRule.validate('StrongP@ss123')).toBe(true);
      expect(passwordRule.validate('C0mpl3x!Pass')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(passwordRule.validate('weak')).toBe(false);
      expect(passwordRule.validate('nospecial123')).toBe(false);
      expect(passwordRule.validate('NoNumbers!')).toBe(false);
    });
  });

  describe('Password Age Validation', () => {
    const ageRule = securityValidationRules.find(r => r.field === 'lastPasswordChange')!;

    it('accepts recent password changes', () => {
      const recent = new Date();
      expect(ageRule.validate(recent)).toBe(true);
    });

    it('rejects old password changes', () => {
      const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days
      expect(ageRule.validate(old)).toBe(false);
    });
  });
});

describe('Performance Validation Rules', () => {
  describe('Image Size Validation', () => {
    const sizeRule = performanceValidationRules.find(r => r.field === 'imageSize')!;

    it('accepts optimized images', () => {
      expect(sizeRule.validate(300 * 1024)).toBe(true); // 300KB
    });

    it('rejects large images', () => {
      expect(sizeRule.validate(600 * 1024)).toBe(false); // 600KB
    });
  });

  describe('Cache Control Validation', () => {
    const cacheRule = performanceValidationRules.find(r => r.field === 'cacheControl')!;

    it('accepts valid cache headers', () => {
      expect(cacheRule.validate({ 'cache-control': 'max-age=3600' })).toBe(true);
    });

    it('rejects missing cache headers', () => {
      expect(cacheRule.validate({})).toBe(false);
    });
  });
});

describe('Data Quality Validation Rules', () => {
  describe('Description Quality', () => {
    const descRule = dataQualityValidationRules.find(r => r.field === 'description')!;

    it('accepts good quality descriptions', () => {
      expect(descRule.validate(
        'This is a high-quality description that provides meaningful information about the logo.'
      )).toBe(true);
    });

    it('rejects poor quality descriptions', () => {
      expect(descRule.validate('too short')).toBe(false);
      expect(descRule.validate('aaaaaaaaaa')).toBe(false);
    });
  });

  describe('Tag Quality', () => {
    const tagRule = dataQualityValidationRules.find(r => r.field === 'tags')!;

    it('accepts good quality tags', () => {
      expect(tagRule.validate(['logo', 'brand', 'technology', 'modern'])).toBe(true);
    });

    it('rejects poor quality tags', () => {
      expect(tagRule.validate(['tag1', 'tag2'])).toBe(false);
    });
  });
});

describe('Accessibility Validation Rules', () => {
  describe('Alt Text Validation', () => {
    const altTextRule = accessibilityValidationRules.find(r => r.field === 'altText')!;

    it('accepts good alt text', () => {
      expect(altTextRule.validate('Company logo featuring a blue mountain peak')).toBe(true);
    });

    it('rejects poor alt text', () => {
      expect(altTextRule.validate('image of logo')).toBe(false);
      expect(altTextRule.validate('a')).toBe(false);
    });
  });

  describe('Color Contrast Validation', () => {
    const contrastRule = accessibilityValidationRules.find(r => r.field === 'contrast')!;

    it('accepts sufficient contrast', () => {
      expect(contrastRule.validate({
        background: '#FFFFFF',
        foreground: '#000000'
      })).toBe(true);
    });

    it('rejects insufficient contrast', () => {
      expect(contrastRule.validate({
        background: '#FFFFFF',
        foreground: '#CCCCCC'
      })).toBe(false);
    });
  });
});

describe('Auto-Fix Generation', () => {
  describe('Color Format Fixes', () => {
    it('converts 3-digit hex to 6-digit', () => {
      const doc = { colors: ['#F00', '#0F0', '#00F'] };
      const fixes = generateAutoFixes(doc, 'Invalid color format');
      expect(fixes[0].newValue).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('adds # prefix to valid hex', () => {
      const doc = { colors: ['FF0000', '00FF00'] };
      const fixes = generateAutoFixes(doc, 'Invalid color format');
      expect(fixes[0].newValue).toEqual(['#FF0000', '#00FF00']);
    });
  });

  describe('Bio Content Fixes', () => {
    it('removes HTML and normalizes whitespace', () => {
      const doc = {
        profile: {
          bio: '<p>This  is   a    bio</p>  with  <b>HTML</b>'
        }
      };
      const fixes = generateAutoFixes(doc, 'Invalid bio content');
      expect(fixes[0].newValue).toBe('This is a bio with HTML');
    });
  });
});

describe('Auto-Fix Application', () => {
  it('applies fixes to nested fields', () => {
    const doc = {
      profile: {
        bio: '<p>Bio with HTML</p>'
      }
    };
    const fixes = [{
      field: 'profile.bio',
      oldValue: doc.profile.bio,
      newValue: 'Bio without HTML',
      fixApplied: 'Removed HTML',
      description: 'Bio contains HTML tags',
      action: 'Remove HTML tags from bio'
    }];
    
    const result = applyAutoFixes(doc, fixes);
    expect(result.profile.bio).toBe('Bio without HTML');
  });

  it('preserves unmodified fields', () => {
    const doc = {
      field1: 'value1',
      field2: 'value2'
    };
    const fixes = [{
      field: 'field1',
      oldValue: 'value1',
      newValue: 'new value',
      fixApplied: 'Updated value',
      description: 'Field value needs update',
      action: 'Update field value'
    }];
    
    const result = applyAutoFixes(doc, fixes);
    expect(result.field1).toBe('new value');
    expect(result.field2).toBe('value2');
  });
}); 