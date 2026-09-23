import { StyleSheet } from 'react-native';
import { COLORS, LAYOUT, fontFamily } from '../../utils';

export const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  label: { fontSize: 13, fontFamily: fontFamily.Poppins.SemiBold, color: COLORS.textMain, marginBottom: 8 },
  inputWrapper: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: LAYOUT.radius,
    paddingHorizontal: 12,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: COLORS.textMain },
  errorText: { color: COLORS.danger, fontSize: 11, marginTop: 4, fontFamily: fontFamily.Poppins.Medium },
});
