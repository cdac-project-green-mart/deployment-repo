import AboutIntro from "../components/about/AboutIntro";
import AboutFeatures from "../components/about/AboutFeatures";
import AboutDelivery from "../components/about/AboutDelivery";
import Testimonials from "../components/testimonials/Testimonials";
import FeaturedBrands from "../components/featuredBrands/FeaturedBrands";

export default function About(){
    return (
        <div>
    <AboutIntro/>
    <AboutFeatures/>
    <AboutDelivery/>
    <div className="container h-[400px] flex items-center justify-center bg-[#F2F2F2]">
    <Testimonials/>
    </div>
    <div>
         <FeaturedBrands/>
    </div>
   
    </div>

    );

}