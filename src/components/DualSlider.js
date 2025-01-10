import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

const minDistance = 100; // Minimum distance between the points

export default function DualSlider({ minPrice, setMinPrice, maxPrice, setMaxPrice }) {
  const [value, setValue] = useState([minPrice, maxPrice]); // Initialize with props values

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      // Update the min value while maintaining the minDistance
      const newMin = Math.min(newValue[0], value[1] - minDistance);
      setValue([newMin, value[1]]);
      setMinPrice(newMin); // Update the parent minPrice state
    } else {
      // Update the max value while maintaining the minDistance
      const newMax = Math.max(newValue[1], value[0] + minDistance);
      setValue([value[0], newMax]);
      setMaxPrice(newMax); // Update the parent maxPrice state
    }
  };

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}$`} // Format the value with a dollar sign
        disableSwap
        min={0}
        max={1000}
        valueLabelDisplay="auto"
        sx={{
          '& .MuiSlider-thumb': {
            backgroundColor: '#e683b4', // Change thumb color
          },
          '& .MuiSlider-track': {
            backgroundColor: '#e683b4', // Change track color
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#d3d3d3', // Change rail color
          },
        }}
      />
    </Box>
  );
}
