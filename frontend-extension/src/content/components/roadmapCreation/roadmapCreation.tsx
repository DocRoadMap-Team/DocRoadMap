/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import getToken from "../../utils/utils";
import DecisionTreeChat from "./decisionTree";

const basePath = "./assets/";

const backendUrl = "https://www.docroadmap.fr";

const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getImageForCardName = (name: string): string => {
  const lower = normalize(name);

  if (lower.includes("naissance"))
    return chrome.runtime.getURL(`${basePath}born_roadmap.png`);
  if (lower.includes("demenagement"))
    return chrome.runtime.getURL(`${basePath}moving_roadmap.png`);
  if (lower.includes("enfant"))
    return chrome.runtime.getURL(`${basePath}keep_children.png`);
  if (lower.includes("parent"))
    return chrome.runtime.getURL(`${basePath}move_from_parents_roadmap.png`);
  if (lower.includes("logement") || lower.includes("acheter"))
    return chrome.runtime.getURL(`${basePath}buy_roadmap.png`);
  if (lower.includes("emploi") || lower.includes("travail"))
    return chrome.runtime.getURL(`${basePath}find_job_roadmap.png`);
  if (lower.includes("passeport") || lower.includes("passport"))
    return chrome.runtime.getURL(`${basePath}passport_roadmap.png`);
  if (lower.includes("carte") && lower.includes("identite"))
    return chrome.runtime.getURL(`${basePath}id_roadmap.png`);

  return chrome.runtime.getURL(`${basePath}docroadmap.png`);
};

interface Step {
  id: number;
  name: string;
  collection_name: string;
  image: string;
}

const RoadmapCreation: React.FC = () => {
  const { t } = useTranslation();
  const [, setUser] = useState<any>(null); //user
  const [stepsData, setStepsData] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);
  // const [usedStepsIds, setUsedStepsIds] = useState<number[]>([]);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();

      if (!token) {
        setError(t("tokenUnavailable"));
        return;
      }
      try {
        const userRes = await axios.get(`${backendUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ id: userRes.data.id });

        const stepsRes = await axios.get(
          `${backendUrl}/list-administrative-process`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const enrichedSteps = stepsRes.data.map((step: any) => ({
          ...step,
          image: getImageForCardName(step.name),
        }));

        setStepsData(enrichedSteps);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
        setError(t("loadError"));
      }
    };

    fetchData();
  }, [t]);

  // const generateUniqueStepsId = (): number => {
  //   let id: number;
  //   do {
  //     id = Math.floor(Math.random() * 900) + 101;
  //   } while (usedStepsIds.includes(id));
  //   setUsedStepsIds((prev) => [...prev, id]);
  //   return id;
  // };

  // const handleCreateCard = async (step: Step) => {
  //   const token = await getToken();
  //   if (!user?.id || !token) return;

  //   try {
  //     const stepsId = generateUniqueStepsId();

  //     await axios.post(
  //       "http://51.91.161.226:8082/process/create",
  //       {
  //         name: step.name,
  //         description: step.collection_name,
  //         status: "PENDING",
  //         userId: user.id,
  //         stepsId,
  //         endedAt: "2024-12-12, 12:00:00",
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     console.error("Erreur lors de la création :", error);
  //     setError(t("createError"));
  //   }
  // };

  return (
    <div className="roadmap-panel-container">
      <style>{`
        .roadmap-panel-container {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .roadmap-header {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-bottom: 0.25rem;
          flex-direction: row;
          border-bottom: 1px solid #e0e0e0;
        }
        .roadmap-title {
          font-size: 1.1rem;
          font-weight: bold;
          padding: 0.5rem 0;
          color: black;
          flex-direction: row;
          margin: 0;
        }
        .error-message {
          color: #e53e3e;
          background: #fff0f0;
          border: 1px solid #e53e3e;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .carousel-container {
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 0.5rem;
        }
        .carousel-container::-webkit-scrollbar {
          width: 6px;
        }
        .carousel-container::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 3px;
        }
        .carousel-container {
          scrollbar-width: thin;
          scrollbar-color: #e0e0e0 #f7f8fa;
        }
        .card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
          width: 100%;
          max-width: 100%;
          flex-direction: row;
          align-items: flex-start;
          transition: box-shadow 0.2s;
          position: relative;
          box-sizing: border-box;
        }
        .card:hover {
          box-shadow: 0 4px 16px rgba(44, 62, 80, 0.14);
        }
        .card-image {
          width: 100%;
          border-radius: 10px 10px 0 0;
        }
        .card-header {
          margin-bottom: 0.2rem;
          background: #007bff;
          padding: 0.5rem 0.75rem;
        }
        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          background: #007bff;
          color: white;
          margin: 0;
          text-align: center;
          word-break: break-word;
        }
        .card-body {
          flex: 1 1 auto;
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .card-body button {
          margin-top: 0.5rem;
          width: 90%;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.18s;
          padding: 0.5rem 0.75rem;
        }
        .card-body button:hover {
          background: #225ea8;
        }
      `}</style>

      <div className="roadmap-header">
        <h1 className="roadmap-title">{t("createRoadmap")}</h1>
      </div>

      {error && <p className="error-message">{error}</p>}
      {showChat ? (
        <DecisionTreeChat onClose={() => setShowChat(false)} />
      ) : (
        <div className="carousel-container">
          {stepsData.map((step) => (
            <div className="card" key={step.id}>
              <img
                className="card-image"
                src={step.image}
                alt={t("imageAlt")}
              />
              <div className="card-header">
                <h3>{step.name}</h3>
              </div>
              <div className="card-body">
                <button
                  onClick={() => {
                    setShowChat(true);
                  }}
                >
                  {" "}
                  {/* handleCreateCard(step); */}
                  {t("createThis")}
                </button>
                {showChat && (
                  <DecisionTreeChat onClose={() => setShowChat(false)} />
                )}

                {/* <button onClick={() => handleCreateCard(step)}>
                {t("createThis")}
              </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapCreation;
