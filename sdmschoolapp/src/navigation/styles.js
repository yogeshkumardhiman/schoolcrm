
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth, COLORS as Colors } from '../utils';
const ADD_BTN_SIZE = screenWidth(16);
const OTHER_BTN_SIZE = screenWidth(7);
export default StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    // Use padding instead of fixed height to avoid extra gap with SafeAreaView
    paddingTop: screenHeight(1.2),
    paddingBottom: screenHeight(1.2),
    borderTopWidth: 1,
    borderTopColor: Colors.green,
    // backgroundColor: 'transparent',


  },
  mainItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImage: {
    width: ADD_BTN_SIZE,
    height: ADD_BTN_SIZE,
    alignSelf: 'center',
    marginBottom: screenHeight(0.1),
    resizeMode: 'contain'
  },
  otherViewParent: {
    justifyContent: 'center',
    alignItems: 'center',
    // Avoid stretching to full container height which creates bottom gap
    paddingHorizontal: 5,


  },
  otherTabImage: {
    width: OTHER_BTN_SIZE,
    height: OTHER_BTN_SIZE,
    alignSelf: 'center',
    resizeMode: 'contain',

  },
  text: {
    fontSize: screenWidth(3),
    marginTop: screenWidth(.5),
    // fontFamily: fontFamily.Roboto.Bold,
    textAlign: 'center',
  },


});

