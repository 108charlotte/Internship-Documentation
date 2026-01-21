import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Containerization with Docker',
    img: require('@site/static/img/docker-logo.png').default,
    description: (
      <>
        This tutorial explains Docker and guides you through creating a multi-container full-stack application configured with Docker Compose. 
      </>
    ),
  },
  {
    title: 'Full-Stack Applications',
    img: require('@site/static/img/full-stack-developer.png').default,
    description: (
      <>
        Learn how to create a frontend with React, backend with Django, and database with PostgreSQL, and set up communication between them. (image credit: <a href="https://www.flaticon.com/free-icons/development" title="development icons">Development icons created by Talha Dogar - Flaticon</a>)
      </>
    ),
  },
  {
    title: 'Hosting on AWS',
    img: require('@site/static/img/aws.png').default,
    description: (
      <>
        Learn how to use the AWS console by deploy a multi-container application on an AWS EC2 instance. 
      </>
    ),
  },
];

function Feature({img, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={img} className={styles.featureSvg} alt={title} style={{objectFit: 'contain'}} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
