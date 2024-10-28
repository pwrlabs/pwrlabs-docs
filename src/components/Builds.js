import "./index.css"
import { useColorMode } from '@docusaurus/theme-common';

export default () => {
    const { colorMode } = useColorMode();

    const projects = [
        {
            title: "Decentralized Applications (DApps)",
            description: "Quickly build and deploy scalable DApps on PWR Chain, from basic transactions to complex decentralized solutions.",
            img: (
                <svg className="stroke-svg" width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.715 16.2546L3.75 20.0046L10.715 23.7546M10.715 16.2546L20 21.2546L29.285 16.2546M10.715 16.2546L3.75 12.5046L20 3.75464L36.25 12.5046L29.285 16.2546M10.715 23.7546L3.75 27.5046L20 36.2546L36.25 27.5046L29.285 23.7546M10.715 23.7546L20 28.7546L29.285 23.7546M29.285 16.2546L36.25 20.0046L29.285 23.7546" stroke="var(--svg-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            )
        },
        {
            title: "Virtual Machines (VMs)",
            description: "Create, configure and manage custom virtual machines on PWR Chain, enabling specialized use cases and seamless integration.",
            img: (
                <svg className="stroke-svg" width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35 12.5046L20 3.75464L5 12.5046M35 12.5046L20 21.2546M35 12.5046V27.5046L20 36.2546M5 12.5046L20 21.2546M5 12.5046V27.5046L20 36.2546M20 21.2546V36.2546" stroke="var(--svg-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            )
        },
        {
            title: "Smart Contracts",
            description: "Develop robust smart contracts using our flexible infrastructure, ensuring secure and efficient execution on PWR Chain.",
            img: (
                <svg className="stroke-svg" width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.499 23.7546V19.3796C32.499 17.8878 31.9064 16.4571 30.8515 15.4022C29.7966 14.3473 28.3659 13.7546 26.874 13.7546H24.374C23.8767 13.7546 23.3998 13.5571 23.0482 13.2055C22.6966 12.8538 22.499 12.3769 22.499 11.8796V9.37964C22.499 7.8878 21.9064 6.45706 20.8515 5.40216C19.7966 4.34727 18.3659 3.75464 16.874 3.75464H13.749M13.749 25.0046H26.249M13.749 30.0046H19.999M17.499 3.75464H9.37402C8.33902 3.75464 7.49902 4.59464 7.49902 5.62964V34.3796C7.49902 35.4146 8.33902 36.2546 9.37402 36.2546H30.624C31.659 36.2546 32.499 35.4146 32.499 34.3796V18.7546C32.499 14.7764 30.9187 10.9611 28.1056 8.14804C25.2926 5.33499 21.4773 3.75464 17.499 3.75464Z" stroke="var(--svg-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            )
        },
        {
            title: "Software Applications",
            description: "Expand your development possibilities by integrating PWR Chain with software applications across multiple programming languages.",
            img: (
                <svg className="stroke-svg" width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 11.468V10.0046C10 9.01008 10.3951 8.05625 11.0983 7.35299C11.8016 6.64973 12.7554 6.25464 13.75 6.25464H26.25C27.2446 6.25464 28.1984 6.64973 28.9016 7.35299C29.6049 8.05625 30 9.01008 30 10.0046V11.468M10 11.468C10.3917 11.3296 10.8117 11.2546 11.25 11.2546H28.75C29.1883 11.2546 29.6083 11.3296 30 11.468M10 11.468C9.26869 11.7265 8.63555 12.2055 8.18781 12.8389C7.74007 13.4723 7.49977 14.229 7.5 15.0046V16.468M30 11.468C30.7313 11.7265 31.3644 12.2055 31.8122 12.8389C32.2599 13.4723 32.5002 14.229 32.5 15.0046V16.468M7.5 16.468C7.89167 16.3296 8.31167 16.2546 8.75 16.2546H31.25C31.6758 16.2541 32.0985 16.3263 32.5 16.468M7.5 16.468C6.04333 16.983 5 18.3713 5 20.0046V30.0046C5 30.9992 5.39509 31.953 6.09835 32.6563C6.80161 33.3595 7.75544 33.7546 8.75 33.7546H31.25C32.2446 33.7546 33.1984 33.3595 33.9016 32.6563C34.6049 31.953 35 30.9992 35 30.0046V20.0046C35.0002 19.229 34.7599 18.4723 34.3122 17.8389C33.8644 17.2055 33.2313 16.7265 32.5 16.468" stroke="var(--svg-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            )
        }
    ]

    return (
        <div className="build-section">
            <h2 className="section-title">What You Can Build Today</h2>
            
            <div className="cards-container">
            {projects.map((project, index) => (
                <div key={index} className="card">
                    <div className="card-icon">
                        {project.img}
                    </div>
                    <p className="card-title">{project.title}</p>
                    <p className="card-description">{project.description}</p>
                </div>
            ))}
            </div>

            <a href="/developers/developing-on-pwr-chain/what-is-a-decentralized-application" className="explore-link">
                Explore Developer Guides
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </a>
        </div>
    )
}