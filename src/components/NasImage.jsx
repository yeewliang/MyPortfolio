import React from 'react';
import PropTypes from 'prop-types';

const NasImage = ({ folder, filename, alt, width, height, className }) => {
  const baseUrl = import.meta.env.VITE_NAS_BASE_URL;
  
  // Remove trailing slash from baseUrl if present, and leading slash from folder
  const cleanBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  const cleanFolder = folder ? folder.replace(/^\//, '') : '';
  
  const fullPath = `${cleanBaseUrl}/${cleanFolder}/${filename}`;

  return (
    <picture className={className}>
      <source srcSet={`${fullPath}.avif`} type="image/avif" />
      <source srcSet={`${fullPath}.webp`} type="image/webp" />
      <img
        src={`${fullPath}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={className} // Apply className to img as well for styling
      />
    </picture>
  );
};

NasImage.propTypes = {
  folder: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
};

export default NasImage;
