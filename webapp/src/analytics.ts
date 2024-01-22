import mixpanel, {Callback, Dict, RequestOptions} from 'mixpanel-browser';

import {User} from './types/users';

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

    identify(user: User) {
        Mixpanel.identify(user.id);
        Mixpanel.setUserProperty({
            'Email': user.email,
            'Registration Date': new Date(user.created_at).toISOString().split('.')[0],
            'Username': user.username,
            "First Name": user.first_name,
            "Last Name": user.last_name,
            "Language": user.lang,
        });
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

    viewKarelPage(props: Dict) {
        Mixpanel.track('View Karel Page', props);
    }

    runCode(props: Dict) {
        Mixpanel.track('Run Code', props);
    }

    codeError(props: Dict) {
        Mixpanel.track('Error In Code', props);
    }

    getMe() {
        Mixpanel.track('Get Me');
    }

    landing(name: string) {
        Mixpanel.track('View Landing Page', {name: name});
    }

    messagePosted(props: Dict) {
        Mixpanel.track('Message Posted', props);
    }

    messageToAI(props: Dict) {
        Mixpanel.track('Message To AI', props);
    }
}

const AnalyticsObject = new Analytics();

export {
    AnalyticsObject as Analytics
}
