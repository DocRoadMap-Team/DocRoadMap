import React from "react"; //{ useState }
// import axios from "axios";
import getToken from "../../utils/utils";

// const env = import.meta.env.VITE_ENV_MODE;
// const backendUrl =
//   env === "development" ? "http://localhost:8082" : "https://www.docroadmap.fr";

const CorrectAlts: React.FC = () => {
  // const [error, setError] = useState<string | null>(null);

  const handleFindImages = async () => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>("img"),
    );
    const imagesWithoutAlt = images.filter(
      (img) => !img.hasAttribute("alt") || img.getAttribute("alt") === "",
    );

    // to remove later
    const urls = imagesWithoutAlt.map((img) => img.src);
    console.log("Images without alt attributes:", urls);

    const token = await getToken();
    if (!token) {
      // setError("Token non disponible. Veuillez vous connecter.");
      return;
    }
    // for (const img of imagesWithoutAlt) {

    // try {
    //   const response = await axios.get(`${backendUrl}/ai/query-img`, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //     params: { url: img.src },
    //   });

    //   if (response.status !== 200) {
    //     console.error(`Failed to fetch alt for image: ${img.src}`);
    //     continue;
    //   }

    //   const data = response.data;
    //   if (data.alt) {
    //     img.alt = data.alt;
    //     console.log(`Updated alt for image ${img.src}: ${data.alt}`);
    //   }
    // } catch (error) {
    //   console.error(`Error fetching alt for image ${img.src}:`, error);
    // }
    // }
  };

  return (
    <div>
      <button onClick={handleFindImages}>Find images without alt</button>
      {/* {error && <div style={{ color: "red" }}>{error}</div>} */}
    </div>
  );
};

export default CorrectAlts;
