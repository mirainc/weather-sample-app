import Head from "next/head";
import Error from "next/error";
import cn from "classnames";
import styles from "../styles/Weather.module.css";

const openWeatherMapApi = "https://api.openweathermap.org/data/2.5/weather";
const apiKey = process.env.OPENWEATHERMAP_API_KEY;

export async function getServerSideProps(context) {
  const location = context.query.location;
  // Set the response status code to BadRequest if missing the location query param.
  if (!location) {
    context.res.statusCode = 400;
    return {
      props: {
        errorCode: context.res.statusCode,
        errorTitle: "Please provide a location",
      },
    };
  }

  const units = context.query.units === "celsius" ? "metric" : "imperial";

  // Make request to OpenWeatherMap API.
  const res = await fetch(`${openWeatherMapApi}?q=${location}&units=${units}&appid=${apiKey}`);
  // Forward the response status code from OpenWeatherMap API.
  if (!res.ok) {
    context.res.statusCode = res.status;
    return {
      props: {
        errorCode: context.res.statusCode,
        errorTitle: `Failed to load weather for ${location}`,
      },
    };
  }

  const weatherData = await res.json();
  return {
    props: {
      weatherData,
    },
  };
}

export default function Weather({ errorCode, errorTitle, weatherData }) {
  if (errorCode) {
    return <Error statusCode={errorCode} title={errorTitle} />;
  }

  const isSunny = weatherData.clouds.all < 20;
  const temp = Math.round(weatherData.main.temp);
  const city = weatherData.name;

  return (
    <div className={cn(styles.container, { [styles.sunny]: isSunny })}>
      <Head>
        <title>Simple Weather Raydiant App</title>
        <meta name="description" content="Display local weather from around the world." />
        <link rel="icon" href="/favicon.png" />
      </Head>
      It&apos;s&nbsp;<span className={styles.temp}>{temp}&deg;</span>&nbsp;and&nbsp;
      <span className={styles.condition}>{isSunny ? "sunny" : "cloudy"}</span>
      &nbsp;in&nbsp;<span className={styles.city}>{city}</span>.
    </div>
  );
}
