import { useEffect, useState } from "react";

// Component for displaying images
function Image(props) {
    // State variable to store image source
    const [imageSrc, setImageSrc] = useState("");

    // Effect to update image source when blob changes
    useEffect(() => {
        // Create a new FileReader object
        const reader = new FileReader();

        // Read the data URL of the blob and set image source
        reader.readAsDataURL(props.blob);
        reader.onloadend = function () {
            setImageSrc(reader.result);
        };
    }, [props.blob]);

    // Render the image component
    return(
        <img style={{width: "200", height: "200" }} src={imageSrc} />
    );
}

export default Image; // Export the Image component
