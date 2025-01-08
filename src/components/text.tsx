import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface CustomTextProps extends TextProps {
  variant?: 'regular' | 'medium' | 'bold';
}

export function Text({ style, variant = 'regular', ...props }: CustomTextProps) {
  return (
    <RNText
      style={[
        styles.base,
        {
          fontFamily:
            variant === 'bold'
              ? theme.typography.bold
              : variant === 'medium'
                ? theme.typography.medium
                : theme.typography.regular,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.black,
  },
}); 