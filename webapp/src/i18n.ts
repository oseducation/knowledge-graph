import i18n from "i18next";
import {initReactI18next} from "react-i18next";

// the translations
// (TODO move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: {
            "Next Topics": "Next Topics",
            "Topics In Progress": "Topics In Progress",
            "I know this": "I know this",
            "Topic Details": "Topic Details",
            "Resources": "Resources",
            "Active Learners": "Active Learners",
            "Profile": "Profile",
            "Preferences": "Preferences",
            "Progress": "Progress",
            "Logout": "Logout",
            "Carousel Mode": "Carousel Mode",
            "First Name": "First Name",
            "Last Name": "Last Name",
            "Username": "Username",
            "Save": "Save",
            "Cancel": "Cancel",
            "Account Information": "Account Information",
            "preferences": "preferences",
            "Language": "ენა",
            "English": "English",
            "Georgian": "ქართული",
            "Graph Direction": "Graph Direction",
            "Top down": "Top down",
            "Bottom up": "Bottom up",
            "Right to Left": "Right to Left",
            "Left to Right": "Left to Right",
            "Should videos loop in carousel mode: Yes": "Should videos loop in carousel mode: Yes",
            "Should videos loop in carousel mode: No": "Should videos loop in carousel mode: No",
            "Sign in": "Sign in",
            "Sign Up": "Sign Up",
            "Sign Up For Free": "Sign Up For Free",
            "Login": "Login",
            "Email": "Email",
            "Password": "Password",
            "Register": "Register",
            "Log in": "Log in",
            "Create your account": "Create your account",
            "Create account": "Create account",
            "Chat coming soon": "Chat coming soon. Meanwhile if you have any questions regarding this topic, please feel free to call or text our CEO directly +995555476500",
            "Videos": "Videos",
            "Texts": "Texts",
            "Tests": "Tests",
            "Revisit": "Revisit",
            "Please insert youtube video url": "Please insert youtube video url",
            "Do you know the better way to explain this topic? Please upload the YouTube video here:": "Do you know the better way to explain this topic? Please upload the YouTube video here:",
            "Upload Video": "Upload Video",
            "Lifelong Learning Without Courses": "Lifelong Learning Without Courses",
            "Veni, Vidi, Vitsi AI - Learning Made Easy": "Veni, Vidi, Vitsi AI - Learning Made Easy",
            "The World's Knowledge at Your Fingertips": "The World's Knowledge at Your Fingertips",
            "Every piece of knowledge in the world can be depicted through a prerequisite graph, where understanding all the prerequisites paves the way for learning novel concepts. We are building such a graph." : "Every piece of knowledge in the world can be depicted through a prerequisite graph, where understanding all the prerequisites paves the way for learning novel concepts. We are building such a graph.",
            "Built for Lifelong Learning": "Built for Lifelong Learning",
            "No matter where you are in your learning journey, our platform adapts to you. From coding to cooking, explore interconnected concepts and skills at your own pace.": "No matter where you are in your learning journey, our platform adapts to you. From coding to cooking, explore interconnected concepts and skills at your own pace.",
            "Personalized Pathways": "Personalized Pathways",
            "Our algorithm suggests the next concepts to learn based on your past mastery and your future goals. Gain the confidence of knowing you’re on the right path.": "Our algorithm suggests the next concepts to learn based on your past mastery and your future goals. Gain the confidence of knowing you’re on the right path.",
            "Community Contributions": "Community Contributions",
            "Learning is better together. Help the community by sharing resources, or take advantage of others' expertise to enrich your understanding.": "Learning is better together. Help the community by sharing resources, or take advantage of others' expertise to enrich your understanding.",
            "From Vitsi Community": "From Vitsi Community",
            "Ready to Unlock Your Learning Potential?": "Ready to Unlock Your Learning Potential?",
            "Join us at Vitsi.ai and transform the way you learn.": "Join us at Vitsi.ai and transform the way you learn.",
            "George": "George",
            "Love it! Courses are too much of a commitment": "Love it! Courses are too much of a commitment",
            "Nino": "Nino",
            "Vitsi.ai's knowledge graph is an innovation in learning. I believe it will provide an intuitive and clear learning path for various subjects.": "Vitsi.ai's knowledge graph is an innovation in learning. I believe it will provide an intuitive and clear learning path for various subjects.",
            "David": "David",
            "Mapping knowledge into a prerequisite graph could help learners better understand and absorb information.": "Mapping knowledge into a prerequisite graph could help learners better understand and absorb information.",
            "Luke": "Luke",
            "It's like building a mind map but for all the knowledge in the world!": "It's like building a mind map but for all the knowledge in the world!",
            "Ann": "Ann",
            "Understanding the prerequisites before jumping into a complex topic is crucial, and their idea seems to address that perfectly.": "Understanding the prerequisites before jumping into a complex topic is crucial, and their idea seems to address that perfectly.",
            "Mariam": "Mariam",
            "Vitsi.ai's concept of linking concepts together is intriguing. It mirrors how our brain creates connections between related pieces of information.": "Vitsi.ai's concept of linking concepts together is intriguing. It mirrors how our brain creates connections between related pieces of information.",
            "question": "question",
            "Choose wisely": "Choose wisely",
            "You got it!": "You got it!",
            "Sorry, wrong answer!": "Sorry, wrong answer!",
            "Check Answer": "Check Answer",
            "please learn all the prerequisite topics first": "please learn all the prerequisite topics first",
            "Try out karel here": "Try out karel here",
            "Karel Environment": "Karel Environment"
        }
    },
    ge: {
        translation: {
            "Next Topics": "შემდეგი თემები",
            "Topics In Progress": "დაწყებული თემები",
            "I know this": "ეს ვიცი",
            "Topic Details": "დეტალები",
            "Resources": "რესურსები",
            "Active Learners": "მოსწავლეები",
            "Profile": "პროფილი",
            "Preferences": "პარამეტრები",
            "Progress": "პროგრესი",
            "Logout": "გამოსვლა",
            "Carousel Mode": "კარუსელი",
            "First Name": "სახელი",
            "Last Name": "გვარი",
            "Username": "მომხმარებლის სახელი",
            "Save": "შენახვა",
            "Cancel": "გაუქმება",
            "Account Information": "მომხმარებლის ინფორმაცია",
            "preferences": "პარამეტრები",
            "Language": "Language",
            "English": "English",
            "Georgian": "ქართული",
            "Graph Direction": "გრაფის მიმართულება",
            "Top down": "ზემოდან ქვემოთ",
            "Bottom up": "ქვემოდან ზემოთ",
            "Right to Left": "მარჯვნიდან მარცხნივ",
            "Left to Right": "მარცხნიდან მარჯვნივ",
            "Should videos loop in carousel mode: Yes": "კარუსელის დროს ვიდეო თავიდან უნდა იწყებდეს დაკვრას? კი",
            "Should videos loop in carousel mode: No": "კარუსელის დროს ვიდეო თავიდან უნდა იწყებდეს დაკვრას? არა",
            "Sign in": "შესვლა",
            "Sign Up": "რეგისტრაცია",
            "Sign Up For Free": "რეგისტრაცია",
            "Login": "შესვლა",
            "Email": "ელექტრონული ფოსტა",
            "Password": "პაროლი",
            "Register": "რეგისტრაცია",
            "Log in": "შესვლა",
            "Create your account": "შექმენი შენი ანგარიში",
            "Create account": "ანგარიშის შექმნა",
            "Chat coming soon": "ჩატი მალე დაემატება, მანამდე ამ თემასთან დაკავშირებულ ნებისმიერ კითხვაზე დაურეკეთ ან მისწერეთ შოთას, ნომერზე 555476500",
            "Videos": "ვიდეოები",
            "Texts": "ტექსტები",
            "Tests": "ტესტები",
            "Revisit": "თავიდან გავლა",
            "Please insert youtube video url": "გთხოვთ შეიყვანოთ იუტუბის ვიდეოს ბმული",
            "Do you know the better way to explain this topic? Please upload the YouTube video here:": "ამ საკითხის ასახსნელად უკეთესი გზა ხომ არ იცი? მაშინ ატვირთე იუტუბის ვიდეო აქ:",
            "Upload Video": "ვიდეოს ატვირთვა",
            "Lifelong Learning Without Courses": "უწყვეტი განათლება კურსების გარეშე",
            "Veni, Vidi, Vitsi AI - Learning Made Easy": "მივედი, ვნახე, ვიცი - ისწავლე მარტივად",
            "The World's Knowledge at Your Fingertips": "მსოფლიოს ცოდნა შენს ხელთაა",
            "Every piece of knowledge in the world can be depicted through a prerequisite graph, where understanding all the prerequisites paves the way for learning novel concepts. We are building such a graph.": "Vitsi.ai ცნობიზმოყვარეობაზე ორიენტირებული, უწყვეტი სწავლის პლატფორმაა. პლატფორმაზე მსოფლიოში არსებული ცოდნა წარმოდგენილია ურთიერთდკავშირებული, მცირე ზომის ცნებების სახით, რაც მომხმარებელს აძლევს შესაძლებლობას გაიაზროს საკუთარი ცოდნა, მსოფლიო ცოდნა და შეიმუშავოს უმოკლესი გზა თავისი სასწავლო მიზნებისკენ",
            "Built for Lifelong Learning": "შექმნილია უწყვეტი სწავლისთვის",
            "No matter where you are in your learning journey, our platform adapts to you. From coding to cooking, explore interconnected concepts and skills at your own pace.": "რისი სწავლაც არ უნდა გინდოდეს, სწავლის რა ეტაპზეც არ უნდა იყო, ჩვენი პლატფორმა შენზე ადაპტირდება. ისწავლე ურთიერთდაკავშირებული თემები კოდის წერიდან კულინარიამდე საკუთარი ტემპით.",
            "Personalized Pathways": "პერსონალიზირებული გზები",
            "Our algorithm suggests the next concepts to learn based on your past mastery and your future goals. Gain the confidence of knowing you’re on the right path.": "იმის მიხედვით თუ რა იცი და რისი სწავლა გსურს, ჩვენი ალგორითმი თავად შემოგთავაზებს მომდევნო თემებს.",
            "Community Contributions": "ხალხის კონტრიბუცია",
            "Learning is better together. Help the community by sharing resources, or take advantage of others' expertise to enrich your understanding.": "ერთად სწავლა უკეთესია. დაეხმარეთ სხვებს, გაუზიარეთ რესურსები, ან ისარგებლეთ სხვების ცოდნით, საკითხების უკეთ გასაგებად.",
            "From Vitsi Community": "Vitsi-ს მომხმარებლებისგან",
            "Ready to Unlock Your Learning Potential?": "მზად ხარ პოტენციალის მაქსიმიზაციისთვის?",
            "Join us at Vitsi.ai and transform the way you learn.": "შემოგვიერთდი Vitsi.ai-ზე და ისწავლე სრულიად ახლებურად",
            "George": "გიორგი",
            'Love it! Courses are too much of a commitment': "მომწონს! ონლაინ კურსების გავლა ძალიან დიდი ვალდებულებაა ხოლმე",
            "Nino": "ნინო",
            "Vitsi.ai's knowledge graph is an innovation in learning. I believe it will provide an intuitive and clear learning path for various subjects.": "Vitsi.ai-ს ცოდნის გრაფი ძალიან მაგარი რამეა, ინტუიტიურია და მარტივად შეგიძლია სხვადასხვა თემები ისწავლო",
            "David": "დავითი",
            "Mapping knowledge into a prerequisite graph could help learners better understand and absorb information.": "როცა მთელი ცოდნა ასეა დაყოფილი, მარტივია გაიგო საერთოდ რა იცი და რა არა",
            "Luke": "ლუკა",
            "It's like building a mind map but for all the knowledge in the world!": "თითქოს ტვინის რუკას აგებ, ძალიან მაგარია!",
            "Ann": "ანნა",
            "Understanding the prerequisites before jumping into a complex topic is crucial, and their idea seems to address that perfectly.": "კომპლექსურ თემაზე გადასვლამდე მარტივი რაღაცების ცოდნა გადამწყვეტია, მათი იდეა მშვენივრად ეხმიანება ამას",
            "Mariam": "მარიამი",
            "Vitsi.ai's concept of linking concepts together is intriguing. It mirrors how our brain creates connections between related pieces of information.": "დამაინტრიგებელია სხვადასხვა ცნებების ერთმანეთთან დაკავშირების იდეა. მგონი ჩვენი ტვინიც ასე ქმნის კავშირებს ინფორმაციებს შორის.",
            "question": "შეკითხვა",
            "Choose wisely": "აბა კარგად დაფიქრდი",
            "You got it!": "ეგაა!",
            "Sorry, wrong answer!": "აუ, არასწორია! :(",
            "Check Answer": "შეამოწმე",
            "please learn all the prerequisite topics first": "ჯერ პრერეკვიზიტები ისწავლე",
            "Try out karel here": "კარელი შეგიძლია აქ ნახო",
            "Karel Environment": "კარელის გარემო"
        }
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        // if you're using a language detector, do not define the lng option

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
