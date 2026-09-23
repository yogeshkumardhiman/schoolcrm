import { Dimensions } from "react-native"
const { width, height } = Dimensions.get('window')

const screenWidth = (per) => {
    const widthSize = width < height ? width : height
    return widthSize * per / 100
}
const screenHeight = (per) => {
    const heightSize = width < height ? height : width
    return heightSize * per / 100
}
export { screenHeight, screenWidth, width, height }