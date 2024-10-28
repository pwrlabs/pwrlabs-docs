import "./index.css"
import { useColorMode } from '@docusaurus/theme-common';
import BlockSvg from '/homepage/blocks.svg';

export default () => {
    const { colorMode } = useColorMode();

    const sections = [
        {
            title: "PWR Chain Concepts",
            description: "Find everything you need to learn about PWR Chain.",
            link: "/pwrchain/overview",
            img: (
                <BlockSvg 
                    className="stroke-svg"
                />
            ),
        },
        {
            title: "Developer Quick",
            description: "Get up and running quickly with easy-to-follow setup instructions and examples.",
            link: "/developers/developing-on-pwr-chain/what-is-a-decentralized-application",
            img: (
                <svg className="stroke-svg" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.749 16.2542L27.499 20.0042L23.749 23.7541M16.249 23.7541L12.499 20.0042L16.249 16.2542M9.99902 33.7541H29.999C30.9936 33.7541 31.9474 33.3591 32.6507 32.6558C33.3539 31.9525 33.749 30.9987 33.749 30.0041V10.0042C33.749 9.00959 33.3539 8.05576 32.6507 7.3525C31.9474 6.64924 30.9936 6.25415 29.999 6.25415H9.99902C9.00446 6.25415 8.05063 6.64924 7.34737 7.3525C6.64411 8.05576 6.24902 9.00959 6.24902 10.0042V30.0041C6.24902 30.9987 6.64411 31.9525 7.34737 32.6558C8.05063 33.3591 9.00446 33.7541 9.99902 33.7541Z" stroke="var(--svg-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ),
        },
        {
            title: "Detailed SDK",
            description: "Find everything you need to build with PWR Chain's powerful SDKs.",
            link: "/developers/sdks/installing-and-importing-pwr-sdk",
            img: (
                <svg className="stroke-svg" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.0333 25.2877L28.75 35.0044C29.5833 35.8111 30.7003 36.2579 31.8601 36.2485C33.0199 36.2391 34.1295 35.7742 34.9497 34.9541C35.7698 34.1339 36.2347 33.0243 36.2441 31.8645C36.2535 30.7047 35.8067 29.5877 35 28.7544L25.205 18.9594M19.0333 25.2877L23.1933 20.2377C23.7217 19.5977 24.4267 19.1944 25.2067 18.9611C26.1233 18.6877 27.145 18.6477 28.1117 18.7277C29.4147 18.8396 30.7244 18.6088 31.9107 18.0583C33.097 17.5077 34.1187 16.6565 34.8744 15.5891C35.6301 14.5217 36.0936 13.2752 36.2189 11.9734C36.3441 10.6716 36.1267 9.35961 35.5883 8.16773L30.1283 13.6294C29.2148 13.4182 28.379 12.9547 27.716 12.2917C27.0531 11.6287 26.5896 10.7929 26.3783 9.87939L31.8383 4.41939C30.6464 3.881 29.3345 3.66363 28.0327 3.78887C26.7308 3.9141 25.4844 4.37758 24.417 5.13331C23.3496 5.88904 22.4984 6.91075 21.9478 8.09705C21.3972 9.28336 21.1664 10.593 21.2783 11.8961C21.43 13.6894 21.16 15.6694 19.7717 16.8127L19.6017 16.9544M19.0333 25.2877L11.275 34.7094C10.899 35.1677 10.4312 35.5423 9.90166 35.8089C9.37215 36.0755 8.79268 36.2283 8.20055 36.2575C7.60842 36.2866 7.01674 36.1915 6.46361 35.9781C5.91048 35.7648 5.40814 35.438 4.98894 35.0188C4.56973 34.5996 4.24294 34.0972 4.0296 33.5441C3.81627 32.991 3.72111 32.3993 3.75025 31.8072C3.7794 31.215 3.9322 30.6356 4.19882 30.1061C4.46544 29.5766 4.83998 29.1087 5.29833 28.7327L16.6933 19.3494L9.84833 12.5044H7.5L3.75 6.25439L6.25 3.75439L12.5 7.50439V9.85273L19.6 16.9527L16.6917 19.3477M30.625 30.6294L26.25 26.2544M8.11166 31.8794H8.125V31.8927H8.11166V31.8794Z" stroke="var(--svg-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ),
        }
    ]

    return (
        <div className="get-started">
          <h2 className="get-started-title">Get Started with PWR Chain</h2>
          <p className="get-started-subtitle">
            Ready to Build? Dive into our documentation, explore guides,or integrate directly.
          </p>
    
          <div className="cards-grid">
            {sections.map((section, index) => (
                <div key={index} className="get-started-card">
                    <div className="card-icon">
                        {section.img}
                    </div>
                    <h3 className="card-title">{section.title}</h3>
                    <p className="card-description">
                        {section.description}
                    </p>
                    <a href={section.link} className="card-link">
                        Let's Start
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14m-7-7l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            ))}
          </div>
        </div>
    );
}