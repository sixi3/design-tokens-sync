import React, { useState } from 'react';
import { 
  generateButtonClasses, 
  generateVoiceButtonClasses,
  generateCardClasses,
  generateInputClasses,
  DESIGN_SYSTEM_THEME 
} from '../../utils/design-system';
import type { VoiceState, ButtonVariant, ButtonSize } from '../../types/design-system';
import DesignSystemManager from './DesignSystemManager';

export const DesignSystemShowcase: React.FC = () => {
  const [, setVoiceState] = useState<VoiceState>('idle');
  const [inputValue, setInputValue] = useState('');
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const colorPalettes = [
    { name: 'Primary', colors: DESIGN_SYSTEM_THEME.colors.primary },
    { name: 'Secondary', colors: DESIGN_SYSTEM_THEME.colors.secondary },
    { name: 'Neutral', colors: DESIGN_SYSTEM_THEME.colors.neutral },
    { name: 'Success', colors: DESIGN_SYSTEM_THEME.colors.success },
    { name: 'Warning', colors: DESIGN_SYSTEM_THEME.colors.warning },
    { name: 'Error', colors: DESIGN_SYSTEM_THEME.colors.error },
  ];

  const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  const buttonSizes: ButtonSize[] = ['small', 'medium', 'large'];
  const voiceStates: VoiceState[] = ['idle', 'listening', 'processing', 'speaking', 'error'];

  const typographyExamples = [
    { class: 'text-display-large', label: 'Display Large', text: 'Display Large Text' },
    { class: 'text-display-medium', label: 'Display Medium', text: 'Display Medium Text' },
    { class: 'text-display-small', label: 'Display Small', text: 'Display Small Text' },
    { class: 'text-headline-large', label: 'Headline Large', text: 'Headline Large Text' },
    { class: 'text-headline-medium', label: 'Headline Medium', text: 'Headline Medium Text' },
    { class: 'text-headline-small', label: 'Headline Small', text: 'Headline Small Text' },
    { class: 'text-title-large', label: 'Title Large', text: 'Title Large Text' },
    { class: 'text-title-medium', label: 'Title Medium', text: 'Title Medium Text' },
    { class: 'text-title-small', label: 'Title Small', text: 'Title Small Text' },
    { class: 'text-body-large', label: 'Body Large', text: 'Body Large Text for main content' },
    { class: 'text-body-medium', label: 'Body Medium', text: 'Body Medium Text for descriptions' },
    { class: 'text-body-small', label: 'Body Small', text: 'Body Small Text for captions' },
    { class: 'text-label-large', label: 'Label Large', text: 'LABEL LARGE TEXT' },
    { class: 'text-label-medium', label: 'Label Medium', text: 'LABEL MEDIUM TEXT' },
    { class: 'text-label-small', label: 'Label Small', text: 'LABEL SMALL TEXT' },
  ];

  const spacingExamples = [
    { value: '0', size: '0rem' },
    { value: '1', size: '0.25rem' },
    { value: '2', size: '0.5rem' },
    { value: '4', size: '1rem' },
    { value: '6', size: '1.5rem' },
    { value: '8', size: '2rem' },
    { value: '12', size: '3rem' },
    { value: '16', size: '4rem' },
    { value: '24', size: '6rem' },
  ];

  const shadowExamples = [
    { name: 'xs', class: 'shadow-xs' },
    { name: 'sm', class: 'shadow-sm' },
    { name: 'md', class: 'shadow-md' },
    { name: 'lg', class: 'shadow-lg' },
    { name: 'xl', class: 'shadow-xl' },
    { name: '2xl', class: 'shadow-2xl' },
    { name: 'voice-idle', class: 'shadow-voice-idle' },
    { name: 'voice-listening', class: 'shadow-voice-listening' },
    { name: 'voice-processing', class: 'shadow-voice-processing' },
  ];

  const borderRadiusExamples = [
    { name: 'none', class: 'rounded-none' },
    { name: 'sm', class: 'rounded-sm' },
    { name: 'md', class: 'rounded-md' },
    { name: 'lg', class: 'rounded-lg' },
    { name: 'xl', class: 'rounded-xl' },
    { name: '2xl', class: 'rounded-2xl' },
    { name: '3xl', class: 'rounded-3xl' },
    { name: 'full', class: 'rounded-full' },
  ];

  const ColorPalette: React.FC<{ name: string; colors: Record<string, string> }> = ({ name, colors }) => (
    <div className="mb-8">
      <h3 className="text-title-large text-gray-900 mb-4">{name} Colors</h3>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(colors).map(([shade, color]) => (
          <div key={shade} className="text-center">
            <div 
              className="w-full h-16 rounded-lg mb-2 border border-gray-200"
              style={{ backgroundColor: color }}
            />
            <div className="text-label-small text-gray-600">{shade}</div>
            <div className="text-label-small text-gray-500 font-mono">{color}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-display-large text-gray-900 mb-4">
            Design System Showcase
          </h1>
          <p className="text-body-large text-gray-600">
            A comprehensive demonstration of all design system elements including colors, typography, 
            spacing, components, and utilities.
          </p>
        </div>

        {/* Colors Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Color Palettes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {colorPalettes.map((palette) => (
              <ColorPalette key={palette.name} name={palette.name} colors={palette.colors} />
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Typography Scale</h2>
          <div className="space-y-6">
            {typographyExamples.map((example) => (
              <div key={example.class} className="flex items-center gap-8">
                <div className="w-32 text-label-medium text-gray-500">
                  {example.label}
                </div>
                <div className={`${example.class} text-gray-900`}>
                  {example.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Buttons</h2>
          
          {/* Button Variants */}
          <div className="mb-8">
            <h3 className="text-title-large text-gray-900 mb-4">Button Variants</h3>
            <div className="flex flex-wrap gap-4">
              {buttonVariants.map((variant) => (
                <button
                  key={variant}
                  className={generateButtonClasses(variant, 'medium')}
                  onClick={() => console.log(`${variant} clicked`)}
                >
                  {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
                </button>
              ))}
            </div>
          </div>

          {/* Button Sizes */}
          <div className="mb-8">
            <h3 className="text-title-large text-gray-900 mb-4">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              {buttonSizes.map((size) => (
                <button
                  key={size}
                  className={generateButtonClasses('primary', size)}
                  onClick={() => console.log(`${size} clicked`)}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Button States */}
          <div className="mb-8">
            <h3 className="text-title-large text-gray-900 mb-4">Voice Button States</h3>
            <div className="flex flex-wrap gap-4">
              {voiceStates.map((state) => (
                <div key={state} className="text-center">
                  <button
                    className={generateVoiceButtonClasses(state)}
                    onClick={() => setVoiceState(state)}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="text-label-small text-gray-600 mt-2">
                    {state}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={generateCardClasses(false, 6)}>
              <h3 className="text-title-large text-gray-900 mb-2">Basic Card</h3>
              <p className="text-body-medium text-gray-600">
                This is a basic card with standard elevation and padding.
              </p>
            </div>
            <div className={generateCardClasses(true, 6)}>
              <h3 className="text-title-large text-gray-900 mb-2">Elevated Card</h3>
              <p className="text-body-medium text-gray-600">
                This card has elevated styling with more prominent shadows.
              </p>
            </div>
            <div className="gradient-primary p-6 rounded-2xl text-white">
              <h3 className="text-title-large mb-2">Gradient Card</h3>
              <p className="text-body-medium opacity-90">
                This card uses the primary gradient background.
              </p>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Form Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="text-label-medium text-gray-600 mb-2 block">
                Normal Input
              </label>
              <input
                type="text"
                className={generateInputClasses(false)}
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <label className="text-label-medium text-gray-600 mb-2 block">
                Error Input
              </label>
              <input
                type="text"
                className={generateInputClasses(true)}
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <p className="text-label-small text-error-500 mt-1">
                This field has an error
              </p>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Status Indicators</h2>
          <div className="space-y-4 max-w-lg">
            <div className="status-success px-4 py-3 rounded-lg">
              <p className="text-label-medium">Success: Operation completed successfully</p>
            </div>
            <div className="status-warning px-4 py-3 rounded-lg">
              <p className="text-label-medium">Warning: Please check your input</p>
            </div>
            <div className="status-error px-4 py-3 rounded-lg">
              <p className="text-label-medium">Error: Something went wrong</p>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Spacing Scale</h2>
          <div className="space-y-4">
            {spacingExamples.map((example) => (
              <div key={example.value} className="flex items-center gap-4">
                <div className="w-16 text-label-medium text-gray-500">
                  {example.value}
                </div>
                <div className="w-24 text-label-small text-gray-600">
                  {example.size}
                </div>
                <div 
                  className="bg-primary-500 rounded"
                  style={{ width: example.size, height: '1rem' }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Shadows Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Box Shadows</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {shadowExamples.map((example) => (
              <div key={example.name} className="text-center">
                <div className={`${example.class} bg-surface-primary p-6 rounded-xl mb-2`}>
                  <div className="text-label-medium text-gray-600">
                    {example.name}
                  </div>
                </div>
                <div className="text-label-small text-gray-500">
                  {example.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Border Radius</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {borderRadiusExamples.map((example) => (
              <div key={example.name} className="text-center">
                <div className={`${example.class} bg-primary-100 border-2 border-primary-500 p-6 mb-2`}>
                  <div className="text-label-medium text-primary-700">
                    {example.name}
                  </div>
                </div>
                <div className="text-label-small text-gray-500">
                  {example.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Animations Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-2 animate-voice-pulse" />
              <div className="text-label-small text-gray-600">voice-pulse</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-500 rounded-full mx-auto mb-2 animate-voice-processing" />
              <div className="text-label-small text-gray-600">voice-processing</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-2 animate-breath" />
              <div className="text-label-small text-gray-600">breath</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-500 rounded-full mx-auto mb-2 animate-float" />
              <div className="text-label-small text-gray-600">float</div>
            </div>
          </div>
        </section>

        {/* Utilities Section */}
        <section className="mb-16">
          <h2 className="text-headline-large text-gray-900 mb-8">Utility Classes</h2>
          
          {/* Gradients */}
          <div className="mb-8">
            <h3 className="text-title-large text-gray-900 mb-4">Gradients</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="gradient-primary p-6 rounded-2xl text-white text-center">
                <div className="text-title-medium">Primary Gradient</div>
              </div>
              <div className="gradient-secondary p-6 rounded-2xl text-neutral-900 text-center">
                <div className="text-title-medium">Secondary Gradient</div>
              </div>
              <div className="gradient-neutral p-6 rounded-2xl text-gray-900 text-center">
                <div className="text-title-medium">Neutral Gradient</div>
              </div>
            </div>
          </div>

          {/* Loading States */}
          <div className="mb-8">
            <h3 className="text-title-large text-gray-900 mb-4">Loading States</h3>
            <div className="flex items-center gap-6">
              <div className="loading-spinner w-8 h-8" />
              <div className="space-y-2">
                <div className="loading-skeleton h-4 w-48 rounded" />
                <div className="loading-skeleton h-4 w-32 rounded" />
                <div className="loading-skeleton h-4 w-40 rounded" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 mt-16">
          <p className="text-body-medium text-gray-600 text-center">
            Design System built with DM Sans, Tailwind CSS, and TypeScript
          </p>
        </footer>
      </div>

      {/* Floating Design System Manager Button */}
      <button
        onClick={() => setIsManagerOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
        title="Open Design System Manager"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      {/* Design System Manager Modal */}
      <DesignSystemManager 
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />
    </div>
  );
};

export default DesignSystemShowcase; 