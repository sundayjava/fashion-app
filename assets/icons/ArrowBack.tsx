import React from 'react';
import Svg, { Path, SvgProps } from "react-native-svg";

export const ArrowBack = (props: SvgProps) => {
    const { width = 24, height = 24 } = props;
    return (
        <Svg fill="currentColor" viewBox="0 0 96 96" width={width} height={height} {...props}>
            <Path d="M39.3756,48.0022l30.47-25.39a6.0035,6.0035,0,0,0-7.6878-9.223L26.1563,43.3906a6.0092,6.0092,0,0,0,0,9.2231L62.1578,82.615a6.0035,6.0035,0,0,0,7.6878-9.2231Z" />
        </Svg>
    )
}