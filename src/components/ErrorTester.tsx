'use client';

import { useState } from 'react';
import { AlertTriangle, Bug, Info, Zap } from 'lucide-react';

export function ErrorTester() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const tests = [
    {
      icon: <Bug className="w-5 h-5" />,
      title: 'Console Error',
      description: 'Викликає console.error',
      color: 'red',
      action: () => {
        console.error('Тестова помилка від DevHelper');
        addResult('Console error викликано');
      }
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Console Warning',
      description: 'Викликає console.warn',
      color: 'yellow',
      action: () => {
        console.warn('Тестове попередження від DevHelper');
        addResult('Console warning викликано');
      }
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Runtime Error',
      description: 'Викликає runtime помилку',
      color: 'purple',
      action: () => {
        try {
          throw new Error('Тестова runtime помилка');
        } catch (error) {
          console.error(error);
          addResult('Runtime error викликано');
        }
      }
    },
    {
      icon: <Info className="w-5 h-5" />,
      title: 'Promise Rejection',
      description: 'Викликає unhandled rejection',
      color: 'blue',
      action: () => {
        Promise.reject('Тестове відхилення Promise').catch(() => {
          addResult('Promise rejection викликано');
        });
      }
    },
    {
      icon: <Bug className="w-5 h-5" />,
      title: 'Undefined Error',
      description: 'Спроба доступу до undefined',
      color: 'red',
      action: () => {
        try {
          const obj: any = undefined;
          console.log(obj.property);
        } catch (error) {
          console.error('Cannot read property of undefined');
          addResult('Undefined error викликано');
        }
      }
    },
    {
      icon: <Bug className="w-5 h-5" />,
      title: 'Type Error',
      description: 'Викликає помилку типу',
      color: 'red',
      action: () => {
        try {
          const num: any = null;
          num.toFixed(2);
        } catch (error) {
          console.error('TypeError: Cannot read property toFixed');
          addResult('Type error викликано');
        }
      }
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Network Error',
      description: 'Симулює помилку мережі',
      color: 'yellow',
      action: () => {
        fetch('https://invalid-url-that-does-not-exist.com')
          .catch(error => {
            console.error('Network Error:', error.message);
            addResult('Network error викликано');
          });
      }
    },
    {
      icon: <Info className="w-5 h-5" />,
      title: 'Multiple Errors',
      description: 'Викликає декілька помилок підряд',
      color: 'blue',
      action: () => {
        console.error('Помилка 1');
        console.warn('Попередження 1');
        console.error('Помилка 2');
        console.warn('Попередження 2');
        addResult('Множинні помилки викликано');
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-500 hover:bg-red-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      blue: 'bg-blue-500 hover:bg-blue-600'
    };
    return colors[color] || colors.red;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">🧪 Тестування помилок</h2>
        <p className="text-gray-600 mb-4">
          Натисніть на кнопки нижче, щоб згенерувати різні типи помилок.
          Потім відкрийте віджет DevHelper у правому нижньому куті, щоб побачити результати.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tests.map((test, index) => (
          <button
            key={index}
            onClick={test.action}
            className={`${getColorClasses(test.color)} text-white p-4 rounded-lg transition flex flex-col items-start gap-2 text-left`}
          >
            <div className="flex items-center gap-2">
              {test.icon}
              <span className="font-bold">{test.title}</span>
            </div>
            <span className="text-sm opacity-90">{test.description}</span>
          </button>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Лог тестування:</h3>
            <button
              onClick={() => setTestResults([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Очистити
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold mb-2">💡 Підказка:</h4>
        <p className="text-sm text-gray-700">
          Після виклику помилок, відкрийте віджет DevHelper (кнопка 🐛 в правому нижньому куті)
          та натисніть "Завантажити звіт", щоб отримати детальний markdown файл з усіма помилками
          та рекомендаціями щодо їх виправлення.
        </p>
      </div>
    </div>
  );
}
