// @flow

import config from 'lib/config';

const trackerName = config.googleAnalytics.trackers.editorial;
const send = `${trackerName}.send`;

const extractLinkText = (el: ?HTMLElement): ?string => {
    let text;

    if (el && typeof el.textContent === 'string') {
        text = el.textContent.trim();
    }

    return text;
};

const trackNonClickInteraction = (actionName: string): void => {
    window.ga(send, 'event', 'Interaction', actionName, {
        nonInteraction: true, // to avoid affecting bounce rate
    });
};

const trackSamePageLinkClick = (target: HTMLElement, tag: string): void => {
    window.ga(send, 'event', 'click', 'in page', tag, {
        nonInteraction: true, // to avoid affecting bounce rate
        dimension13: extractLinkText(target),
    });
};

const trackExternalLinkClick = (target: HTMLElement, tag: string): void => {
    window.ga(send, 'event', 'click', 'external', tag, {
        dimension13: extractLinkText(target),
    });
};

const trackSponsorLogoLinkClick = (target: Object): void => {
    const sponsorName = target.dataset.sponsor;

    window.ga(send, 'event', 'click', 'sponsor logo', sponsorName, {
        nonInteraction: true,
    });
};

const trackNativeAdLinkClick = (slotName: string, tag: string): void => {
    window.ga(send, 'event', 'click', 'native ad', tag, {
        nonInteraction: true,
        dimension25: slotName,
    });
};

const sendPerformanceEvent = (event: Object): void => {
    const boostGaUserTimingFidelityMetrics = {
        standardStart: 'metric18',
        standardEnd: 'metric19',
        commercialStart: 'metric20',
        commercialEnd: 'metric21',
        enhancedStart: 'metric22',
        enhancedEnd: 'metric23',
    };

    window.ga(
        send,
        'timing',
        event.timingCategory,
        event.timingVar,
        event.timeSincePageLoad,
        event.timingLabel
    );

    /*
       send performance events as normal events too,
       so we can avoid the 0.1% sampling that affects timing events
    */
    if (config.switches.boostGaUserTimingFidelity) {
        // these are our own metrics that map to our timing events
        const metric = boostGaUserTimingFidelityMetrics[event.timingVar];

        const fields = {
            nonInteraction: true,
            dimension44: metric, // dimension44 is dotcomPerformance
        };

        fields[metric] = event.timeSincePageLoad;

        window.ga(
            send,
            'event',
            event.timingCategory,
            event.timingVar,
            event.timingLabel,
            event.timeSincePageLoad,
            fields
        );
    }
};

/*
   Track important user timing metrics so that we can be notified and measure
   over time in GA
   https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings
   Tracks into Behaviour > Site Speed > User Timings in GA
*/
const trackPerformance = (
    timingCategory: string,
    timingVar: any,
    timingLabel: string
): void => {
    if (window.performance && window.performance.now && window.ga) {
        const timeSincePageLoad = Math.round(window.performance.now());

        sendPerformanceEvent({
            timingCategory,
            timingVar,
            timeSincePageLoad,
            timingLabel,
        });
    }
};

export default {
    trackNonClickInteraction,
    trackSamePageLinkClick,
    trackExternalLinkClick,
    trackSponsorLogoLinkClick,
    trackNativeAdLinkClick,
    trackPerformance,
};
