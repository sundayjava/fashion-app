import { act, renderHook } from '@testing-library/react-native';
import { useThemeStore } from '@/stores/themeStore';

// Reset store between tests
beforeEach(() => {
  useThemeStore.setState({ preference: 'system' });
});

describe('themeStore', () => {
  it('initializes with system preference', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(result.current.preference).toBe('system');
  });

  it('sets preference to light', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setPreference('light');
    });

    expect(result.current.preference).toBe('light');
  });

  it('sets preference to dark', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setPreference('dark');
    });

    expect(result.current.preference).toBe('dark');
  });

  it('sets preference back to system', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setPreference('dark');
    });
    act(() => {
      result.current.setPreference('system');
    });

    expect(result.current.preference).toBe('system');
  });

  it('exposes setPreference as a function', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(typeof result.current.setPreference).toBe('function');
  });
});
