import Article from "@/components/landing-page/Article";
import AboutMe from "@/components/about-me/AboutMe";
import MyTools from "@/components/landing-page/MyTools";


import HeaderMain from "@/components/landing-page/HeaderMain";
import ArticleMain from "@/components/landing-page/ArticleMain";

export default function Home() {
  return (
    <div>
      <HeaderMain />
      <ArticleMain />
      {/* <Article />
      <AboutMe />
      <MyTools /> */}
    </div>
  );
}
