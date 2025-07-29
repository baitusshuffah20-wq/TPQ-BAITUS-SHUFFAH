// API functions for achievements

// Badge API functions
export async function getBadges(filters?: {
  category?: string;
  rarity?: string;
  status?: string;
  search?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.category) params.append("category", filters.category);
  if (filters?.rarity) params.append("rarity", filters.rarity);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const response = await fetch(
    `/api/achievements/badges?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch badges");
  }

  return response.json();
}

export async function getBadge(id: string) {
  const response = await fetch(`/api/achievements/badges/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch badge");
  }

  return response.json();
}

export async function createBadge(data: any) {
  const response = await fetch("/api/achievements/badges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create badge");
  }

  return response.json();
}

export async function updateBadge(id: string, data: any) {
  const response = await fetch(`/api/achievements/badges/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update badge");
  }

  return response.json();
}

export async function deleteBadge(id: string) {
  const response = await fetch(`/api/achievements/badges/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete badge");
  }

  return response.json();
}

// Santri Achievement API functions
export async function getSantriAchievements(filters?: {
  santriId?: string;
  badgeId?: string;
  status?: string;
  search?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.santriId) params.append("santriId", filters.santriId);
  if (filters?.badgeId) params.append("badgeId", filters.badgeId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const response = await fetch(
    `/api/achievements/santri?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch santri achievements");
  }

  return response.json();
}

export async function getSantriAchievementSummary() {
  const response = await fetch("/api/achievements/santri", {
    method: "HEAD",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch santri achievement summary");
  }

  return response.json();
}

export async function getSantriAchievement(id: string) {
  const response = await fetch(`/api/achievements/santri/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch santri achievement");
  }

  return response.json();
}

export async function createSantriAchievement(data: any) {
  const response = await fetch("/api/achievements/santri", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create santri achievement");
  }

  return response.json();
}

export async function updateSantriAchievement(id: string, data: any) {
  const response = await fetch(`/api/achievements/santri/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update santri achievement");
  }

  return response.json();
}

export async function deleteSantriAchievement(id: string) {
  const response = await fetch(`/api/achievements/santri/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete santri achievement");
  }

  return response.json();
}

export async function sendAchievementNotification(id: string) {
  const response = await fetch(`/api/achievements/santri/${id}/notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send achievement notification");
  }

  return response.json();
}

export async function generateAchievementCertificate(id: string) {
  const response = await fetch(`/api/achievements/santri/${id}/certificate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || "Failed to generate achievement certificate",
    );
  }

  return response.json();
}

export async function downloadAchievementCertificate(id: string) {
  const response = await fetch(`/api/achievements/santri/${id}/certificate`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || "Failed to download achievement certificate",
    );
  }

  return response.json();
}
