import HeaderMain from "@/components/landing-page/HeaderMain";
import ArticleMain from "@/components/landing-page/ArticleMain";
import MyProject from "@/components/landing-page/MyProject";
import AboutMe from "@/components/landing-page/AboutMe";
import Footer from "@/components/landing-page/Footer";
import Cv from "@/components/landing-page/Cv";
import MyTools from "@/components/landing-page/MyTools";

export default function Home() {

  return (
     <div className="relative pt-[81px] max-w-[1560px] w-full mx-auto">
      
      {/* <Article />
      <AboutMe />
      <MyTools /> */}
      
      <HeaderMain />
      <ArticleMain />
      <AboutMe />
      <MyProject />
      <MyTools />
      <Cv />
      <Footer />

    </div>
  );
}


