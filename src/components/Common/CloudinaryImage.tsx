"use client";

import { CldImage, CldImageProps } from 'next-cloudinary';

interface CloudinaryImageProps extends CldImageProps {
    alt: string;
}

const CloudinaryImage = (props: CloudinaryImageProps) => {
    return (
        <CldImage
            {...props}
            format="auto"
            quality="auto"
        />
    );
};

export default CloudinaryImage;
