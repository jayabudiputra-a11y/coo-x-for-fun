import { useEffect as _e } from "react";
import { useLocation as _uL } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname: _p } = _uL();

  _e(() => {
    window.scrollTo(0, 0);
  }, [_p]);

  return null;
};

export default ScrollToTop;