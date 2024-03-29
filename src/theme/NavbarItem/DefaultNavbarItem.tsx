/**
 * This file is a swizzled and wrapped component, generated and adapted from the
 * docusaurus source code, copyright of Facebook, Inc.
 *
 * The adapted content is licensed under the MIT licence; and the licence can be
 * found at https://github.com/facebook/docusaurus/blob/master/LICENSE
 *
 * To learn more about component swizzling, see:
 * https://docusaurus.io/docs/using-themes#wrapping-theme-components
 *
 * For original sources see:
 * https://github.com/facebook/docusaurus/tree/v2.0.0-beta.3/packages/docusaurus-theme-classic/src/theme
 */
import React, {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {Props} from '@theme/NavbarItem/DefaultNavbarItem';
import {fetchGithubStargazerCount} from "./fetch-github-stargazer-count";
import OriginalNavbarItem from '@theme-original/NavbarItem/DefaultNavbarItem';

import styles from './DefaultNavbarItem.module.css';

// We are handling different "appearances" here. They mostly just style the nav bar item, but
// "github" also fetches the stargazer count for the link URL and sets the result as a link label.
function DefaultNavbarItem(props: Props): JSX.Element {
    let bufAppearance;
    [bufAppearance, props] = extractBufAppearance(props);
    let classNames: string[] = [styles.hideExternalLinkIcon];
    if (props.className) {
        classNames.push(props.className);
    }
    switch (bufAppearance) {
        case "button":
            classNames.push(styles.button);
            break;
        case "dark-button":
            classNames.push(styles.darkButton);
            break;
        case "light-button":
            classNames.push(styles.lightButton);
            break;
        case "github":
            classNames.push(styles.github, styles.iconButton, styles.lightButton);
            break;
        case "slack":
            classNames.push(styles.slack, styles.iconButton, styles.lightButton);
            break;
        default:
            classNames.push(styles.link);
            break;
    }

    const label = typeof props.label === "string" ? props.label : "GitHub";

    const [bufStargazerCount, setBufStargazerCount] = useState(label);

    useEffect(() => {
        let cancelled = false;
        if (bufAppearance === "github") {
            const githubUrl = props.prependBaseUrlToHref ? useBaseUrl(props.href, {forcePrependBaseUrl: true}) : props.href;
            fetchGithubStargazerCount(githubUrl, label)
                .then(count => {
                    if (!cancelled) {
                        setBufStargazerCount(count);
                    }
                });
        }
        return () => {
            cancelled = true;
        };
    });

    if (bufAppearance === "github") {
        return <OriginalNavbarItem className={classNames.join(" ")} {...props} label={bufStargazerCount} />;
    }

    return <OriginalNavbarItem className={classNames.join(" ")} {...props} />;
}


function extractBufAppearance(props: Props): ["button" | "dark-button" | "light-button" | "slack" | "github" | undefined, Props] {
    let {bufAppearance, ...rest} = props as any;
    switch (bufAppearance) {
        case "button":
        case "dark-button":
        case "light-button":
        case "slack":
        case "github":
            return [bufAppearance, rest];
    }
    return [undefined, rest];
}

export default DefaultNavbarItem;
