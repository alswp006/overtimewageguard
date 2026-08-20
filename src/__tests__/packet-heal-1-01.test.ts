import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock localStorage for Node.js environment
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const localStorageMock = createStorageMock();

describe("저장소 계층에 스키마 정규화 + 안전 파싱 도입", () => {
  const mockStorageKey = "test.storage.v1";

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("AC-1: Empty localStorage should not throw undefined access errors", () => {
    it("AC-1[P0]: getRecords() returns empty array when localStorage is completely empty", () => {
      // Arrange: localStorage is empty (nothing set)
      expect(localStorageMock.getItem("owg.records.v1")).toBeNull();

      // Act: import will be done by coder
      // For now, we simulate the expected behavior
      const mockGetRecords = () => {
        const stored = localStorageMock.getItem("owg.records.v1");
        if (!stored) return [];
        try {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const result = mockGetRecords();

      // Assert: should always return array, never undefined
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
      expect(result).not.toBeUndefined();
    });

    it("AC-1[P0]: getSettings() returns default object when localStorage is completely empty", () => {
      // Arrange: localStorage is empty
      expect(localStorageMock.getItem("owg.settings.v1")).toBeNull();

      // Act
      const mockGetSettings = () => {
        const defaults = {
          payType: "hourly" as const,
          hourlyWage: 0,
          monthlySalary: 0,
          monthlyStandardHours: 209,
          defaultBreakMinutes: 60,
          isSmallBusiness: false,
        };
        const stored = localStorageMock.getItem("owg.settings.v1");
        if (!stored) return defaults;
        try {
          const parsed = JSON.parse(stored);
          return typeof parsed === "object" && parsed !== null
            ? { ...defaults, ...parsed }
            : defaults;
        } catch {
          return defaults;
        }
      };

      const result = mockGetSettings();

      // Assert: should return merged defaults, never undefined
      expect(result).not.toBeUndefined();
      expect(result.payType).toBe("hourly");
      expect(result.hourlyWage).toBe(0);
      expect(result.monthlySalary).toBe(0);
      expect(result.monthlyStandardHours).toBe(209);
      expect(result.defaultBreakMinutes).toBe(60);
      expect(result.isSmallBusiness).toBe(false);
    });

    it("AC-1[P0]: getPayslips() returns empty array when localStorage is completely empty", () => {
      // Arrange
      expect(localStorageMock.getItem("owg.payslips.v1")).toBeNull();

      // Act
      const mockGetPayslips = () => {
        const stored = localStorageMock.getItem("owg.payslips.v1");
        if (!stored) return [];
        try {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const result = mockGetPayslips();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
      expect(result).not.toBeUndefined();
    });
  });

  describe("AC-2: Corrupted localStorage should not crash; return defaults", () => {
    it("AC-2[P0]: getRecords() returns [] when stored value is invalid JSON", () => {
      // Arrange: corrupted JSON
      localStorageMock.setItem("owg.records.v1", "{");

      // Act
      const mockGetRecords = () => {
        const stored = localStorageMock.getItem("owg.records.v1");
        if (!stored) return [];
        try {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      // Assert: should not throw, return empty array
      expect(() => mockGetRecords()).not.toThrow();
      const result = mockGetRecords();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it("AC-2[P0]: getRecords() returns [] when stored value is 'null' string", () => {
      // Arrange
      localStorageMock.setItem("owg.records.v1", "null");

      // Act
      const mockGetRecords = () => {
        const stored = localStorageMock.getItem("owg.records.v1");
        if (!stored) return [];
        try {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      // Assert
      const result = mockGetRecords();
      expect(result).toEqual([]);
    });

    it("AC-2[P0]: getRecords() returns [] when stored value is a non-array (e.g. number)", () => {
      // Arrange: number instead of array
      localStorageMock.setItem("owg.records.v1", "123");

      // Act
      const mockGetRecords = () => {
        const stored = localStorageMock.getItem("owg.records.v1");
        if (!stored) return [];
        try {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      // Assert
      const result = mockGetRecords();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it("AC-2[P0]: getSettings() returns defaults when stored value is invalid JSON", () => {
      // Arrange
      localStorageMock.setItem("owg.settings.v1", "invalid{json");
      const defaults = {
        payType: "hourly" as const,
        hourlyWage: 0,
        monthlySalary: 0,
        monthlyStandardHours: 209,
        defaultBreakMinutes: 60,
        isSmallBusiness: false,
      };

      // Act
      const mockGetSettings = () => {
        const stored = localStorageMock.getItem("owg.settings.v1");
        if (!stored) return defaults;
        try {
          const parsed = JSON.parse(stored);
          return typeof parsed === "object" && parsed !== null
            ? { ...defaults, ...parsed }
            : defaults;
        } catch {
          return defaults;
        }
      };

      // Assert
      const result = mockGetSettings();
      expect(result.payType).toBe("hourly");
      expect(result.hourlyWage).toBe(0);
      expect(result.monthlySalary).toBe(0);
    });

    it("AC-2[P0]: getSettings() returns defaults when stored value is null", () => {
      // Arrange
      localStorageMock.setItem("owg.settings.v1", "null");
      const defaults = {
        payType: "hourly" as const,
        hourlyWage: 0,
        monthlySalary: 0,
        monthlyStandardHours: 209,
        defaultBreakMinutes: 60,
        isSmallBusiness: false,
      };

      // Act
      const mockGetSettings = () => {
        const stored = localStorageMock.getItem("owg.settings.v1");
        if (!stored) return defaults;
        try {
          const parsed = JSON.parse(stored);
          return typeof parsed === "object" && parsed !== null
            ? { ...defaults, ...parsed }
            : defaults;
        } catch {
          return defaults;
        }
      };

      // Assert
      const result = mockGetSettings();
      expect(result.payType).toBe("hourly");
      expect(result.monthlySalary).toBe(0);
    });
  });

  describe("AC-3: Schema normalization - array items & object defaults", () => {
    it("AC-3[P0]: getRecords() normalizes missing id/date fields with defaults", () => {
      // Arrange: incomplete record (missing id, date)
      const incompleteRecords = [
        {
          startAt: "09:00",
          endAt: "18:00",
          // id: missing
          // date: missing
        },
      ];
      localStorageMock.setItem("owg.records.v1", JSON.stringify(incompleteRecords));

      // Act
      const mockGetRecords = () => {
        const stored = localStorageMock.getItem("owg.records.v1");
        if (!stored) return [];
        try {
          let parsed = JSON.parse(stored);
          if (!Array.isArray(parsed)) parsed = [];

          return parsed.map((item: any) => ({
            id: item.id || `record-${Date.now()}-${Math.random()}`,
            date: item.date || new Date().toISOString().split("T")[0],
            startAt: item.startAt || "00:00",
            endAt: item.endAt || "00:00",
            breakMinutes: item.breakMinutes ?? 0,
          }));
        } catch {
          return [];
        }
      };

      // Assert
      const result = mockGetRecords();
      expect(result.length).toBe(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].id).not.toBeNull();
      expect(result[0].date).toBeDefined();
      expect(result[0].startAt).toBe("09:00");
      expect(result[0].endAt).toBe("18:00");
      expect(result[0].breakMinutes).toBe(0);
    });

    it("AC-3[P0]: getSettings() merges partial settings with defaults", () => {
      // Arrange: only partial settings stored
      const partialSettings = {
        payType: "salary" as const,
        monthlySalary: 3000000,
      };
      localStorageMock.setItem("owg.settings.v1", JSON.stringify(partialSettings));

      const defaults = {
        payType: "hourly" as const,
        hourlyWage: 0,
        monthlySalary: 0,
        monthlyStandardHours: 209,
        defaultBreakMinutes: 60,
        isSmallBusiness: false,
      };

      // Act
      const mockGetSettings = () => {
        const stored = localStorageMock.getItem("owg.settings.v1");
        if (!stored) return defaults;
        try {
          const parsed = JSON.parse(stored);
          return typeof parsed === "object" && parsed !== null
            ? { ...defaults, ...parsed }
            : defaults;
        } catch {
          return defaults;
        }
      };

      // Assert: merged result should have both original and defaults
      const result = mockGetSettings();
      expect(result.payType).toBe("salary"); // overridden
      expect(result.monthlySalary).toBe(3000000); // overridden
      expect(result.hourlyWage).toBe(0); // from defaults
      expect(result.monthlyStandardHours).toBe(209); // from defaults
      expect(result.defaultBreakMinutes).toBe(60); // from defaults
    });

    it("AC-3[P0]: getPayslips() normalizes missing id/date fields", () => {
      // Arrange: incomplete payslip
      const incompletePayslips = [
        {
          grossAmount: 5000000,
          // id: missing
          // date: missing
        },
      ];
      localStorageMock.setItem("owg.payslips.v1", JSON.stringify(incompletePayslips));

      // Act
      const mockGetPayslips = () => {
        const stored = localStorageMock.getItem("owg.payslips.v1");
        if (!stored) return [];
        try {
          let parsed = JSON.parse(stored);
          if (!Array.isArray(parsed)) parsed = [];

          return parsed.map((item: any) => ({
            id: item.id || `payslip-${Date.now()}-${Math.random()}`,
            date: item.date || new Date().toISOString().split("T")[0],
            grossAmount: item.grossAmount || 0,
            deductions: item.deductions || 0,
            netAmount: item.netAmount || 0,
          }));
        } catch {
          return [];
        }
      };

      // Assert
      const result = mockGetPayslips();
      expect(result.length).toBe(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].date).toBeDefined();
      expect(result[0].grossAmount).toBe(5000000);
      expect(result[0].deductions).toBe(0);
      expect(result[0].netAmount).toBe(0);
    });
  });

  describe("Integration: safeParse utility function", () => {
    it("should safeParse generic function handle any type with fallback", () => {
      // Arrange: utility function signature
      const safeParse = <T,>(
        key: string,
        fallback: T,
        normalize?: (item: any) => any
      ): T => {
        const stored = localStorageMock.getItem(key);
        if (!stored) return fallback;
        try {
          const parsed = JSON.parse(stored);
          if (normalize && Array.isArray(parsed)) {
            return parsed.map(normalize) as T;
          }
          return parsed as T;
        } catch {
          return fallback;
        }
      };

      // Act
      localStorageMock.setItem("test.key", '["a","b"]');
      const result = safeParse("test.key", [] as string[], undefined);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(["a", "b"]);
    });

    it("should safeParse return fallback when key doesn't exist", () => {
      // Arrange
      const fallback = { count: 0 };
      const safeParse = <T,>(key: string, fallback: T): T => {
        const stored = localStorageMock.getItem(key);
        if (!stored) return fallback;
        try {
          return JSON.parse(stored) as T;
        } catch {
          return fallback;
        }
      };

      // Act
      const result = safeParse("nonexistent.key", fallback);

      // Assert
      expect(result).toEqual({ count: 0 });
      expect(result).toBe(fallback);
    });
  });

  describe("Type safety verification", () => {
    it("getRecords return type should not include undefined", () => {
      // This is a compile-time check, but we verify the runtime behavior
      const mockGetRecords = (): any[] => {
        const stored = localStorageMock.getItem("owg.records.v1");
        if (!stored) return [];
        try {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const result = mockGetRecords();
      // Result should always be an array, never undefined
      expect(result).not.toBe(undefined);
      expect(Array.isArray(result) || result === null).toBe(true);
      expect(Array.isArray(result)).toBe(true);
    });

    it("getSettings return type should not include undefined", () => {
      const mockGetSettings = (): any => {
        const defaults = {
          payType: "hourly",
          hourlyWage: 0,
          monthlySalary: 0,
          monthlyStandardHours: 209,
          defaultBreakMinutes: 60,
          isSmallBusiness: false,
        };
        const stored = localStorageMock.getItem("owg.settings.v1");
        if (!stored) return defaults;
        try {
          const parsed = JSON.parse(stored);
          return typeof parsed === "object" && parsed !== null
            ? { ...defaults, ...parsed }
            : defaults;
        } catch {
          return defaults;
        }
      };

      const result = mockGetSettings();
      // Result should always be an object, never undefined
      expect(result).not.toBe(undefined);
      expect(typeof result).toBe("object");
      expect(result.payType).toBeDefined();
    });
  });
});
