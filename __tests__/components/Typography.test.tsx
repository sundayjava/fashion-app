import React from 'react';
import { render } from '@testing-library/react-native';
import { Typography } from '@/components/ui/Typography';

// Mock the theme context
jest.mock('@/context/ThemeContext', () => ({
  useAppTheme: () => ({
    colors: {
      text: '#000000',
      textSecondary: '#666666',
      primary: '#9056b9',
    },
    isDark: false,
    scheme: 'light',
  }),
}));

describe('Typography', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Typography>Hello World</Typography>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies the body variant by default', () => {
    const { getByText } = render(<Typography>Body text</Typography>);
    const el = getByText('Body text');
    expect(el).toBeTruthy();
  });

  it('renders all variant types without crashing', () => {
    const variants = [
      'display', 'h1', 'h2', 'h3', 'h4', 'title',
      'subtitle', 'body', 'caption', 'overline', 'label', 'button',
    ] as const;

    variants.forEach((v) => {
      const { getByText } = render(<Typography variant={v}>Test</Typography>);
      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('applies custom color prop', () => {
    const { getByText } = render(
      <Typography color="#ff0000">Red text</Typography>
    );
    const el = getByText('Red text');
    const style = el.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.color).toBe('#ff0000');
  });

  it('applies center alignment', () => {
    const { getByText } = render(
      <Typography align="center">Centered</Typography>
    );
    const el = getByText('Centered');
    const style = el.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.textAlign).toBe('center');
  });

  it('applies italic style', () => {
    const { getByText } = render(
      <Typography italic>Italic text</Typography>
    );
    const el = getByText('Italic text');
    const style = el.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.fontStyle).toBe('italic');
  });

  it('applies underline decoration', () => {
    const { getByText } = render(
      <Typography underline>Underlined</Typography>
    );
    const el = getByText('Underlined');
    const style = el.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.textDecorationLine).toBe('underline');
  });

  it('applies custom font size', () => {
    const { getByText } = render(
      <Typography size={24}>Big text</Typography>
    );
    const el = getByText('Big text');
    const style = el.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.fontSize).toBe(24);
  });

  it('passes testID through rest props', () => {
    const { getByTestId } = render(
      <Typography testID="my-text">Test</Typography>
    );
    expect(getByTestId('my-text')).toBeTruthy();
  });
});
