import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, Button, Stack} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import {useTranslation} from 'react-i18next';

import {Analytics} from '../../../analytics';

interface Props {
    height: string;
    color: string;
}

const Courses = (props: Props) => {
    const {t} = useTranslation();

    return (
        <Grid2 container
            m={0}
            xs={12}
            id='courses-section'
            height={props.height}
            bgcolor={props.color}
            padding={0}
            sx={{scrollSnapAlign: 'start'}}

        >
            <Grid2
                xs={12} sm={9} md={6}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                pl='12px'
            >
                <Stack m={{xs: 0, sm: 4, md: 10}}>
                    <Typography
                        variant='h3'
                        fontWeight={'bold'}
                        color={'white'}
                        p={'30px 0'}
                    >
                        {t("Free Courses")}
                    </Typography>
                </Stack>
            </Grid2>
            <Grid2
                xs={12} sm={3} md={6}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
            >
                {currentCourses.map((course, index) => (
                    <Course key={index} course={course}/>
                ))}
            </Grid2>

        </Grid2>
    )
}

interface CourseProps {
    course: CourseType;
}

const Course = (props: CourseProps) => {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                m: 2,
                display: 'flex',
                flexDirection: 'column',
                bgcolor:'#f6f4ff'
            }}
            onClick={() => {
                Analytics.signUpStarted("startup school hero");
                navigate('/register');
            }}
        >
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="140"
                    image={props.course.image}
                    alt={props.course.name}
                />
                <CardContent>
                    <Typography gutterBottom variant="h4" component="div">
                        {props.course.name}
                    </Typography>
                    <Typography variant="h5" color="text.secondary">
                        {props.course.description}
                    </Typography>
                    {props.course.learnings.length > 0 && <>
                        <Typography variant="body2" color="text.primary" sx={{ mt: 2 }}>
                            What you&apos;ll learn:
                        </Typography>
                        <ul>
                            {props.course.learnings.map((learning, index) => (
                                <li key={index}>
                                    <Typography variant="body2" color="text.primary">
                                        {learning}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                    </>}
                </CardContent>
            </CardActionArea>
            <CardActions>
                {props.course.learnings.length > 0 &&
                    <Button
                        size="small"
                        color="primary"
                        onClick={() => {
                            Analytics.signUpStarted("startup school hero");
                            navigate('/register');
                        }}
                    >
                        Register
                    </Button>
                }
            </CardActions>
        </Card>
    );
};

type CourseType = {
    name: string;
    description: string;
    learnings: string[];
    image: string;
};

const currentCourses: CourseType[] = [
    {
        name: "Startup School",
        description: "Empowering Tomorrow's Innovators: Join the Journey with Y Combinator",
        learnings: ["Getting and Evaluating Startup Ideas", "Planning an MVP and Launching", "Growth and Fundraising"],
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg"
    },
    {
        name: "The Foundations of Entrepreneurship",
        description: "Coming Soon",
        learnings: [],
        image: "https://miro.medium.com/v2/1*D4QuAQxDRm6qnbsT9jE-ug.jpeg"
    }
];

export default Courses;
