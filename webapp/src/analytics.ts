import mixpanel, {Callback, Dict, RequestOptions} from 'mixpanel-browser';

const mixpanelToken = 'd766d089e6f459dbaba1ab3c53b6e4ae'
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    mixpanel.init(mixpanelToken);
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
const Mixpanel = {
    track: (
        event_name: string,
        properties?: Dict,
        optionsOrCallback?: RequestOptions | Callback,
        callback?: Callback,
    ) => {},
    identify: (unique_id?: string) => {},
    reset: () => {},
    setUserProperty: (props: Dict) => {},
    setUserPropertyOnce: (props: Dict) => {}
};

/* eslint-enable @typescript-eslint/no-unused-vars */

if (isProduction) {
    Mixpanel.track = (
        event_name: string,
        properties?: Dict,
        optionsOrCallback?: RequestOptions | Callback,
        callback?: Callback,
    ) => {
        mixpanel.track(event_name, properties, optionsOrCallback, callback);
    }
    Mixpanel.identify = (unique_id?: string) => {
        mixpanel.identify(unique_id);
    }
    Mixpanel.reset = () => {
        mixpanel.reset();
    }
    Mixpanel.setUserProperty = (props: Dict) => {
        mixpanel.people.set(props);
    }
    Mixpanel.setUserPropertyOnce = (props: Dict) => {
        mixpanel.people.set_once(props);
    }
}
/* eslint-enable @typescript-eslint/naming-convention */

class Analytics {
    signUpStarted(entryPoint: string) {
        Mixpanel.track('Sign Up Started', {
            'Entry Point': entryPoint
        })
    }

    signUpCompleted() {
        Mixpanel.track('Sign Up Completed');
    }

    emailVerified() {
        Mixpanel.setUserPropertyOnce({"Email Verified": true})
    }

    loginCompleted() {
        Mixpanel.track("Login Completed")
    }

    identify(id: string) {
        Mixpanel.identify(id);
    }

    setUserProps(props: Dict) {
        Mixpanel.setUserProperty(props);
    }

    setUserPropsOnce(props: Dict) {
        Mixpanel.setUserPropertyOnce(props);
    }

    clickOnTopic(props: Dict) {
        Mixpanel.track('Click On Topic', props);
    }

    learnTopic(props: Dict) {
        Mixpanel.track('Learn Topic', props);
    }

    startTopic(props: Dict) {
        Mixpanel.track('Start Topic', props);
    }

    watchTopic(props: Dict) {
        Mixpanel.track('Watch Topic', props);
    }

    viewTopicPage(props: Dict) {
        Mixpanel.track('View Topic Page', props);
    }

    getMe() {
        Mixpanel.track('Get Me');
    }
}

const AnalyticsObject = new Analytics();

export {
    AnalyticsObject as Analytics
}
