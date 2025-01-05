
import "./DualSlider.css"; // Your custom styles for the slider

const DualSlider = ({minPrice, setMinPrice, maxPrice, setMaxPrice}) => {


    const min = 0;
    const max = 1000;
  
    const handleMinChange = (value) => {
      if (value < maxPrice) setMinPrice(value);
    };
  
    const handleMaxChange = (value) => {
      if (value > minPrice) setMaxPrice(value);
    };
  
    return (
      <div className="slider-container">
        <div className="slider">
          <input
            type="range"
            min={min}
            max={max}
            value={minPrice}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="thumb thumb-left"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={maxPrice}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="thumb thumb-right"
          />
          <div
            className="slider-track"
            style={{
              left: `${(minPrice / max) * 100}%`,
              right: `${100 - (maxPrice / max) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  };
  
  export default DualSlider;