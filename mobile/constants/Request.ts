import {
  SwaggerCreateCardProcess,
  SwaggerCreateStep,
  SwaggerLogin,
  SwaggerProcessList,
  SwaggerProfileInfo,
  SwaggerRegister,
  SwaggerStepList,
  SwaggerProcessPerIdList,
  SwaggerProcessListAdministrative,
  SwaggerAIquery,
  SwaggerAIconversation,
  SwaggerAIHistory,
} from "./Swagger";
import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export type SwaggerRequest<T> =
  | {
      data?: T;
      error: null;
    }
  | {
      error?: string;
    };

const url = process.env.EXPO_PUBLIC_API_URL;

const getAccessToken = async () => {
  return await AsyncStorage.getItem("accessToken");
};

const getId = async (): Promise<number | null> => {
  const id = await AsyncStorage.getItem("id");
  return id ? parseInt(id, 10) : null;
};

const request = {
  register: async (
    data: SwaggerRegister,
  ): Promise<SwaggerRequest<SwaggerRegister>> => {
    try {
      const response = await axios.post(
        `${url}/auth/register`,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        Alert.alert("Compte créer");
        if (status === 400) {
          return {
            error: "Veuillez vérifier vos données et réessayer.",
          };
        } else if (status === 409) {
          return {
            error:
              "L adresse e-mail est déjà utilisée. Veuillez utiliser une autre adresse e-mail.",
          };
        } else if (status === 500) {
          return {
            error: "Problème de serveur interne, veuillez réessayer plus tard",
          };
        } else {
          return {
            error: "Error: ${status}. Quelque chose ne va pas",
          };
        }
      } else {
        console.error("Unexpected error:", error);
        return {
          error: "Error inpromptu. Veuillez réessayer plus tard",
        };
      }
    }
  },
  login: async (data: SwaggerLogin): Promise<SwaggerRequest<SwaggerLogin>> => {
    try {
      const response = await axios.post(
        `${url}/auth/login`,
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        const result = response.data;
        await AsyncStorage.setItem("accessToken", result.accessToken);
        await AsyncStorage.setItem("id", result.id.toString());
        console.log("Connecté !");
        Alert.alert("Connecté ! Bienvenue sur DocRoadmap");
        return {
          data: result,
          error: null,
        };
      } else if (response.status === 400) {
        console.warn("Connexion échoué");
        Alert.alert("Veuillez vérifier vos données et réessayer");
        return {
          error: "Veuillez vérifier vos données et réessayer",
        };
      } else if (response.status === 404) {
        console.warn("Connexion échoué");
        Alert.alert(
          "Mauvaise information. Veuillez vérifier votre mail et votre mot de passe",
        );
        return {
          error:
            "Mauvaise information. Veuillez vérifier votre mail et votre mot de passe",
        };
      } else {
        Alert.alert("Error inpromptu. Veuillez réessayer plus tard");
        return {
          error: "Error inpromptu. Veuillez réessayer plus tard",
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error);
        Alert.alert(
          "Problème de connexion internet, veuillez réessayer plus tard",
        );
        return {
          error: "Problème de connexion internet, veuillez réessayer plus tard",
        };
      } else {
        console.error("Unexpected error:", error);
        Alert.alert(
          "Connexion échoué, veuillez vérifier vos informations et réessayer",
        );
        return {
          error: "Something went wrong. Please try again.",
        };
      }
    }
  },
  create: async (
    data: SwaggerCreateCardProcess,
  ): Promise<SwaggerRequest<SwaggerCreateCardProcess>> => {
    const accessToken = await getAccessToken();
    const id = await getId();
    try {
      const response = await axios.post(
        `${url}/process/create`,
        {
          name: data.name,
          description: data.description,
          status: "PENDING",
          userId: id,
          stepsId: 15,
          endedAt: "2024-12-12, 12:00:00",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          return {
            error:
              "Des champs obligatoires sont manquants. Veuillez vérifier vos entrées et réessayer.",
          };
        } else if (status === 409) {
          return {
            error:
              "Une carte avec ce nom existe déjà. Veuillez choisir un autre nom.",
          };
        } else if (status === 500) {
          return { error: "Erreur serveur. Veuillez réessayer plus tard." };
        } else if (status === 401) {
          return {
            error:
              "Vous n\êtes pas autorisé à créer une carte. Veuillez vous connecter et réessayer.",
          };
        } else {
          return {
            error: `Erreur inattendue : ${status}. Veuillez réessayer plus tard.`,
          };
        }
      } else {
        return { error: "Error inpromptu. Veuillez réessayer plus tard" };
      }
    }
  },
  createStep: async (
    data: SwaggerCreateStep,
  ): Promise<SwaggerRequest<SwaggerCreateStep>> => {
    const accessToken = await getAccessToken();
    try {
      const response = await axios.post(
        `${url}/steps/create`,
        {
          name: data.name,
          description: data.description,
          processId: data.processId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          return {
            error:
              "Données invalides. Veuillez vérifier vos entrées et réessayer.",
          };
        } else if (status === 404) {
          return {
            error:
              "Processus non trouvé. Veuillez vérifier l'ID du processus et réessayer.",
          };
        } else if (status === 403) {
          return {
            error:
              "Accès non autorisé. Vous n'avez pas la permission d'ajouter des étapes.",
          };
        } else if (status === 500) {
          return { error: "Erreur serveur. Veuillez réessayer plus tard." };
        } else {
          return {
            error: `Erreur inattendue : ${status}. Veuillez réessayer plus tard.`,
          };
        }
      } else {
        return { error: "Error inpromptu. Veuillez réessayer plus tard" };
      }
    }
  },
  infoProfile: async (): Promise<SwaggerRequest<SwaggerProfileInfo>> => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(`${url}/users/me`, {
        headers,
      });
      //console.log(response.data)
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        error: "Vous n avez pas la permission",
      };
    }
  },
  stepList: async (): Promise<SwaggerRequest<SwaggerStepList[]>> => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(`${url}/steps/all`, { headers });
      //console.log(response.data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        error: "Vous n avez pas la permission",
      };
    }
  },
  processList: async (): Promise<SwaggerRequest<SwaggerProcessList[]>> => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(`${url}/process/all`, { headers });
      //console.log(response.data)
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        error: "Vous n avez pas la permission",
      };
    }
  },
  processperID: async (): Promise<
    SwaggerRequest<SwaggerProcessPerIdList[]>
  > => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(`${url}/users/me`, {
        headers,
      });
      const processes = response.data?.processes || [];
      //console.log(processes);

      return {
        data: processes,
        error: null,
      };
    } catch (error) {
      console.error(error);
      return {
        error: "Vous n avez pas la permission",
      };
    }
  },
  stepperID: async (processId: number) => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(`${url}/users/me`, { headers });
      const processes = response.data?.processes || [];

      const process = processes.find((p: any) => p.id === processId);
      const steps = process?.steps || [];

      return {
        data: steps,
        error: null,
      };
    } catch (error) {
      console.error(error);
      return {
        error: "Vous n’avez pas la permission",
      };
    }
  },
  listProcessAdministrative: async (): Promise<
    SwaggerRequest<SwaggerProcessListAdministrative>
  > => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(`${url}/list-administrative-process`, {
        headers,
      });

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error(error);
      return {
        error: "Impossible de récupérer les processus administratifs",
      };
    }
  },

  aiQuery: async (
    prompt: string,
    model: string = "gpt-4",
  ): Promise<SwaggerRequest<SwaggerAIquery>> => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.post(
        `${url}/ai/query`,
        {
          prompt: prompt,
          model: model,
        },
        { headers },
      );

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error(error);
      return {
        error: "Impossible de converser avec le chatbot. Veuillez réessayer",
      };
    }
  },

  aiConversation: async (
    collectionName: string,
  ): Promise<SwaggerRequest<SwaggerAIconversation>> => {
    const accessToken = await getAccessToken();
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.post(
        `${url}/ai/start-conversation`,
        { collection_name: collectionName },
        { headers },
      );

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error(error);
      return {
        error: "Impossible de démarrer la conversation",
      };
    }
  },
  aiHistory: async (): Promise<SwaggerRequest<SwaggerAIHistory>> => {
    try {
      const accessToken = await getAccessToken();
      const userId = await getId();

      const response = await axios.get(`${url}/ai-history/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique :", error);
      return {
        error: "Impossible de retrouver l'historique",
      };
    }
  },
};
export default request;
