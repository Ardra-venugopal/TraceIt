
const API_URL = "http://localhost:5000/api/items";

export const itemService = {
    getAll: async (type) => {
        try {
            const url = type
                ? `${API_URL}?type=${encodeURIComponent(type)}`
                : API_URL;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch items.");
            }

            return data;
        } catch (error) {
            console.error("Get items error:", error.message);
            throw error;
        }
    },

    create: async (item, imageFile = null) => {
        try {
            const token = localStorage.getItem("traceit_token");

            const formData = new FormData();

            // Add all item fields to the form.
            Object.entries(item).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            // Attach the actual image file, if provided.
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create item.");
            }

            return data;
        } catch (error) {
            console.error("Create item error:", error.message);
            throw error;
        }
    },
};
