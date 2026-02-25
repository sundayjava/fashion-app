import React from 'react';
import Svg, { G, Path, SvgProps } from "react-native-svg";

export const ArrowDown = (props: SvgProps) => {
    const { width = 24, height = 24 } = props;
    return (
        <Svg viewBox="0 -4.5 20 20" width={width} height={height} {...props}>

            <G id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <G id="Dribbble-Light-Preview" transform="translate(-180.000000, -6684.000000)" fill="currentColor">
                    <G id="icons" transform="translate(56.000000, 160.000000)">
                        <Path d="M144,6525.39 L142.594,6524 L133.987,6532.261 L133.069,6531.38 L133.074,6531.385 L125.427,6524.045 L124,6525.414 C126.113,6527.443 132.014,6533.107 133.987,6535 C135.453,6533.594 134.024,6534.965 144,6525.39" id="arrow_down-[#339]">
                        </Path>
                    </G>
                </G>
            </G>
        </Svg>
    )
}