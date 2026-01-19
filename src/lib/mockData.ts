/**
 * Mock Data for Demo Mode
 * Allows testing the app without a running backend
 */

import type { ColumnInfo } from '@/hooks/useMLStore';

export interface MockDataset {
  name: string;
  description: string;
  icon: string;
  data: Record<string, any>[];
  columns: ColumnInfo[];
}

// Titanic Dataset (Mini)
const titanicData: Record<string, any>[] = [
  { PassengerId: 1, Survived: 0, Pclass: 3, Name: "Braund, Mr. Owen Harris", Sex: "male", Age: 22, SibSp: 1, Parch: 0, Fare: 7.25, Embarked: "S" },
  { PassengerId: 2, Survived: 1, Pclass: 1, Name: "Cumings, Mrs. John Bradley", Sex: "female", Age: 38, SibSp: 1, Parch: 0, Fare: 71.28, Embarked: "C" },
  { PassengerId: 3, Survived: 1, Pclass: 3, Name: "Heikkinen, Miss. Laina", Sex: "female", Age: 26, SibSp: 0, Parch: 0, Fare: 7.93, Embarked: "S" },
  { PassengerId: 4, Survived: 1, Pclass: 1, Name: "Futrelle, Mrs. Jacques Heath", Sex: "female", Age: 35, SibSp: 1, Parch: 0, Fare: 53.10, Embarked: "S" },
  { PassengerId: 5, Survived: 0, Pclass: 3, Name: "Allen, Mr. William Henry", Sex: "male", Age: 35, SibSp: 0, Parch: 0, Fare: 8.05, Embarked: "S" },
  { PassengerId: 6, Survived: 0, Pclass: 3, Name: "Moran, Mr. James", Sex: "male", Age: null, SibSp: 0, Parch: 0, Fare: 8.46, Embarked: "Q" },
  { PassengerId: 7, Survived: 0, Pclass: 1, Name: "McCarthy, Mr. Timothy J", Sex: "male", Age: 54, SibSp: 0, Parch: 0, Fare: 51.86, Embarked: "S" },
  { PassengerId: 8, Survived: 0, Pclass: 3, Name: "Palsson, Master. Gosta Leonard", Sex: "male", Age: 2, SibSp: 3, Parch: 1, Fare: 21.08, Embarked: "S" },
  { PassengerId: 9, Survived: 1, Pclass: 3, Name: "Johnson, Mrs. Oscar W", Sex: "female", Age: 27, SibSp: 0, Parch: 2, Fare: 11.13, Embarked: "S" },
  { PassengerId: 10, Survived: 1, Pclass: 2, Name: "Nasser, Mrs. Nicholas", Sex: "female", Age: 14, SibSp: 1, Parch: 0, Fare: 30.07, Embarked: "C" },
  { PassengerId: 11, Survived: 1, Pclass: 3, Name: "Sandstrom, Miss. Marguerite Rut", Sex: "female", Age: 4, SibSp: 1, Parch: 1, Fare: 16.70, Embarked: "S" },
  { PassengerId: 12, Survived: 1, Pclass: 1, Name: "Bonnell, Miss. Elizabeth", Sex: "female", Age: 58, SibSp: 0, Parch: 0, Fare: 26.55, Embarked: "S" },
  { PassengerId: 13, Survived: 0, Pclass: 3, Name: "Saundercock, Mr. William Henry", Sex: "male", Age: 20, SibSp: 0, Parch: 0, Fare: 8.05, Embarked: "S" },
  { PassengerId: 14, Survived: 0, Pclass: 3, Name: "Andersson, Mr. Anders Johan", Sex: "male", Age: 39, SibSp: 1, Parch: 5, Fare: 31.28, Embarked: "S" },
  { PassengerId: 15, Survived: 0, Pclass: 3, Name: "Vestrom, Miss. Hulda Amanda", Sex: "female", Age: 14, SibSp: 0, Parch: 0, Fare: 7.85, Embarked: "S" },
  { PassengerId: 16, Survived: 1, Pclass: 2, Name: "Hewlett, Mrs. (Mary D Kingcome)", Sex: "female", Age: 55, SibSp: 0, Parch: 0, Fare: 16.00, Embarked: "S" },
  { PassengerId: 17, Survived: 0, Pclass: 3, Name: "Rice, Master. Eugene", Sex: "male", Age: 2, SibSp: 4, Parch: 1, Fare: 29.13, Embarked: "Q" },
  { PassengerId: 18, Survived: 1, Pclass: 2, Name: "Williams, Mr. Charles Eugene", Sex: "male", Age: null, SibSp: 0, Parch: 0, Fare: 13.00, Embarked: "S" },
  { PassengerId: 19, Survived: 0, Pclass: 3, Name: "Vander Planke, Mrs. Julius", Sex: "female", Age: 31, SibSp: 1, Parch: 0, Fare: 18.00, Embarked: "S" },
  { PassengerId: 20, Survived: 1, Pclass: 3, Name: "Masselmani, Mrs. Fatima", Sex: "female", Age: null, SibSp: 0, Parch: 0, Fare: 7.23, Embarked: "C" },
];

const titanicColumns: ColumnInfo[] = [
  { name: "PassengerId", type: "numeric", missing: 0, unique: 20, min: 1, max: 20, mean: 10.5 },
  { name: "Survived", type: "categorical", missing: 0, unique: 2, mode: 0 },
  { name: "Pclass", type: "categorical", missing: 0, unique: 3, mode: 3 },
  { name: "Name", type: "categorical", missing: 0, unique: 20 },
  { name: "Sex", type: "categorical", missing: 0, unique: 2, mode: "male" },
  { name: "Age", type: "numeric", missing: 3, unique: 16, min: 2, max: 58, mean: 29.5, median: 27 },
  { name: "SibSp", type: "numeric", missing: 0, unique: 5, min: 0, max: 4, mean: 0.65 },
  { name: "Parch", type: "numeric", missing: 0, unique: 4, min: 0, max: 5, mean: 0.5 },
  { name: "Fare", type: "numeric", missing: 0, unique: 18, min: 7.23, max: 71.28, mean: 23.56 },
  { name: "Embarked", type: "categorical", missing: 0, unique: 3, mode: "S" },
];

// Iris Dataset (Mini)
const irisData: Record<string, any>[] = [
  { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2, species: "setosa" },
  { sepal_length: 4.9, sepal_width: 3.0, petal_length: 1.4, petal_width: 0.2, species: "setosa" },
  { sepal_length: 4.7, sepal_width: 3.2, petal_length: 1.3, petal_width: 0.2, species: "setosa" },
  { sepal_length: 4.6, sepal_width: 3.1, petal_length: 1.5, petal_width: 0.2, species: "setosa" },
  { sepal_length: 5.0, sepal_width: 3.6, petal_length: 1.4, petal_width: 0.2, species: "setosa" },
  { sepal_length: 5.4, sepal_width: 3.9, petal_length: 1.7, petal_width: 0.4, species: "setosa" },
  { sepal_length: 7.0, sepal_width: 3.2, petal_length: 4.7, petal_width: 1.4, species: "versicolor" },
  { sepal_length: 6.4, sepal_width: 3.2, petal_length: 4.5, petal_width: 1.5, species: "versicolor" },
  { sepal_length: 6.9, sepal_width: 3.1, petal_length: 4.9, petal_width: 1.5, species: "versicolor" },
  { sepal_length: 5.5, sepal_width: 2.3, petal_length: 4.0, petal_width: 1.3, species: "versicolor" },
  { sepal_length: 6.5, sepal_width: 2.8, petal_length: 4.6, petal_width: 1.5, species: "versicolor" },
  { sepal_length: 5.7, sepal_width: 2.8, petal_length: 4.5, petal_width: 1.3, species: "versicolor" },
  { sepal_length: 6.3, sepal_width: 3.3, petal_length: 6.0, petal_width: 2.5, species: "virginica" },
  { sepal_length: 5.8, sepal_width: 2.7, petal_length: 5.1, petal_width: 1.9, species: "virginica" },
  { sepal_length: 7.1, sepal_width: 3.0, petal_length: 5.9, petal_width: 2.1, species: "virginica" },
  { sepal_length: 6.3, sepal_width: 2.9, petal_length: 5.6, petal_width: 1.8, species: "virginica" },
  { sepal_length: 6.5, sepal_width: 3.0, petal_length: 5.8, petal_width: 2.2, species: "virginica" },
  { sepal_length: 7.6, sepal_width: 3.0, petal_length: 6.6, petal_width: 2.1, species: "virginica" },
];

const irisColumns: ColumnInfo[] = [
  { name: "sepal_length", type: "numeric", missing: 0, unique: 15, min: 4.6, max: 7.6, mean: 5.87, std: 0.83 },
  { name: "sepal_width", type: "numeric", missing: 0, unique: 10, min: 2.3, max: 3.9, mean: 3.05, std: 0.38 },
  { name: "petal_length", type: "numeric", missing: 0, unique: 15, min: 1.3, max: 6.6, mean: 3.76, std: 1.77 },
  { name: "petal_width", type: "numeric", missing: 0, unique: 10, min: 0.2, max: 2.5, mean: 1.20, std: 0.76 },
  { name: "species", type: "categorical", missing: 0, unique: 3, mode: "setosa" },
];

// Tips Dataset (Mini)
const tipsData: Record<string, any>[] = [
  { total_bill: 16.99, tip: 1.01, sex: "Female", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 10.34, tip: 1.66, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 3 },
  { total_bill: 21.01, tip: 3.50, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 3 },
  { total_bill: 23.68, tip: 3.31, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 24.59, tip: 3.61, sex: "Female", smoker: "No", day: "Sun", time: "Dinner", size: 4 },
  { total_bill: 25.29, tip: 4.71, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 4 },
  { total_bill: 8.77, tip: 2.00, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 26.88, tip: 3.12, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 4 },
  { total_bill: 15.04, tip: 1.96, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 14.78, tip: 3.23, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 10.27, tip: 1.71, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 35.26, tip: 5.00, sex: "Female", smoker: "No", day: "Sun", time: "Dinner", size: 4 },
  { total_bill: 15.42, tip: 1.57, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 18.43, tip: 3.00, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 4 },
  { total_bill: 14.83, tip: 3.02, sex: "Female", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
  { total_bill: 21.58, tip: 3.92, sex: "Male", smoker: "No", day: "Sun", time: "Dinner", size: 2 },
];

const tipsColumns: ColumnInfo[] = [
  { name: "total_bill", type: "numeric", missing: 0, unique: 16, min: 8.77, max: 35.26, mean: 19.01 },
  { name: "tip", type: "numeric", missing: 0, unique: 16, min: 1.01, max: 5.00, mean: 2.77 },
  { name: "sex", type: "categorical", missing: 0, unique: 2, mode: "Male" },
  { name: "smoker", type: "categorical", missing: 0, unique: 1, mode: "No" },
  { name: "day", type: "categorical", missing: 0, unique: 1, mode: "Sun" },
  { name: "time", type: "categorical", missing: 0, unique: 1, mode: "Dinner" },
  { name: "size", type: "numeric", missing: 0, unique: 3, min: 2, max: 4, mean: 2.69 },
];

// House Prices Dataset (Mini)
const housesData: Record<string, any>[] = [
  { id: 1, bedrooms: 3, bathrooms: 2, sqft: 1500, year_built: 1990, location: "Downtown", price: 350000 },
  { id: 2, bedrooms: 4, bathrooms: 3, sqft: 2200, year_built: 2005, location: "Suburbs", price: 450000 },
  { id: 3, bedrooms: 2, bathrooms: 1, sqft: 900, year_built: 1975, location: "Downtown", price: 220000 },
  { id: 4, bedrooms: 5, bathrooms: 4, sqft: 3500, year_built: 2015, location: "Waterfront", price: 850000 },
  { id: 5, bedrooms: 3, bathrooms: 2, sqft: 1800, year_built: 2000, location: "Suburbs", price: 380000 },
  { id: 6, bedrooms: 4, bathrooms: 2, sqft: 2000, year_built: 1985, location: "Downtown", price: 420000 },
  { id: 7, bedrooms: 2, bathrooms: 1, sqft: 850, year_built: 1960, location: "Rural", price: 150000 },
  { id: 8, bedrooms: 3, bathrooms: 2, sqft: 1600, year_built: 1995, location: "Suburbs", price: 340000 },
  { id: 9, bedrooms: 6, bathrooms: 5, sqft: 4200, year_built: 2020, location: "Waterfront", price: 1200000 },
  { id: 10, bedrooms: 3, bathrooms: 2, sqft: 1400, year_built: 1988, location: "Rural", price: 280000 },
  { id: 11, bedrooms: 4, bathrooms: 3, sqft: 2400, year_built: 2010, location: "Suburbs", price: 520000 },
  { id: 12, bedrooms: 2, bathrooms: 1, sqft: 1000, year_built: 1970, location: "Downtown", price: 260000 },
];

const housesColumns: ColumnInfo[] = [
  { name: "id", type: "numeric", missing: 0, unique: 12, min: 1, max: 12, mean: 6.5 },
  { name: "bedrooms", type: "numeric", missing: 0, unique: 5, min: 2, max: 6, mean: 3.42 },
  { name: "bathrooms", type: "numeric", missing: 0, unique: 5, min: 1, max: 5, mean: 2.33 },
  { name: "sqft", type: "numeric", missing: 0, unique: 12, min: 850, max: 4200, mean: 1946 },
  { name: "year_built", type: "numeric", missing: 0, unique: 12, min: 1960, max: 2020, mean: 1993 },
  { name: "location", type: "categorical", missing: 0, unique: 4, mode: "Suburbs" },
  { name: "price", type: "numeric", missing: 0, unique: 12, min: 150000, max: 1200000, mean: 451667 },
];

export const MOCK_DATASETS: MockDataset[] = [
  {
    name: "Titanic",
    description: "Classification",
    icon: "🚢",
    data: titanicData,
    columns: titanicColumns,
  },
  {
    name: "Iris",
    description: "Multi-Class",
    icon: "🌸",
    data: irisData,
    columns: irisColumns,
  },
  {
    name: "Tips",
    description: "Regression",
    icon: "💵",
    data: tipsData,
    columns: tipsColumns,
  },
  {
    name: "Houses",
    description: "Price Prediction",
    icon: "🏠",
    data: housesData,
    columns: housesColumns,
  },
];

/**
 * Load a mock dataset by name
 */
export function loadMockDataset(name: string): MockDataset | null {
  return MOCK_DATASETS.find(d => d.name.toLowerCase() === name.toLowerCase()) || null;
}
