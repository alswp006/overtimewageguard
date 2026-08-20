import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Paragraph, Spacing, Switch, TextField, Top } from "@toss/tds-mobile";
import ScreenScaffold from "@/components/ScreenScaffold";
import Card from "@/components/Card";
import { SubmitFooter } from "@/components/BottomCTA";
import { useSettings } from "@/hooks/useSettings";
import {
  validateBreakMinutes,
  validateHourlyWage,
  validateMonthlySalary,
  validateMonthlyStandardHours,
} from "@/lib/validation";
import type { PayType } from "@/lib/types";
import { tdsColor } from "@/lib/theme";

function toDigits(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

function toNumber(raw: string): number {
  return raw ? Number(raw) : 0;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();

  const [payType, setPayType] = useState<PayType>(settings.payType);
  const [hourlyWage, setHourlyWage] = useState(settings.hourlyWage ? String(settings.hourlyWage) : "");
  const [monthlySalary, setMonthlySalary] = useState(
    settings.monthlySalary ? String(settings.monthlySalary) : ""
  );
  const [monthlyStandardHours, setMonthlyStandardHours] = useState(
    settings.monthlyStandardHours ? String(settings.monthlyStandardHours) : ""
  );
  const [breakMinutes, setBreakMinutes] = useState(
    settings.defaultBreakMinutes ? String(settings.defaultBreakMinutes) : ""
  );
  const [isSmallBusiness, setIsSmallBusiness] = useState(settings.isSmallBusiness);

  const hourlyWageCheck = useMemo(() => validateHourlyWage(toNumber(hourlyWage)), [hourlyWage]);
  const monthlySalaryCheck = useMemo(() => validateMonthlySalary(toNumber(monthlySalary)), [monthlySalary]);
  const monthlyStandardHoursCheck = useMemo(
    () => validateMonthlyStandardHours(toNumber(monthlyStandardHours)),
    [monthlyStandardHours]
  );
  const breakMinutesCheck = useMemo(() => validateBreakMinutes(toNumber(breakMinutes)), [breakMinutes]);

  const canSave =
    breakMinutesCheck.valid &&
    (payType === "hourly"
      ? hourlyWageCheck.valid
      : monthlySalaryCheck.valid && monthlyStandardHoursCheck.valid);

  const handleSave = () => {
    if (!canSave) return;
    updateSettings({
      payType,
      hourlyWage: toNumber(hourlyWage),
      monthlySalary: toNumber(monthlySalary),
      monthlyStandardHours: toNumber(monthlyStandardHours),
      defaultBreakMinutes: toNumber(breakMinutes),
      isSmallBusiness,
    });
    navigate(-1);
  };

  return (
    <ScreenScaffold
      top={<Top title="시급 · 근무 설정" />}
      bottom={
        <SubmitFooter onClick={handleSave} disabled={!canSave}>
          설정 저장
        </SubmitFooter>
      }
    >
      <Card testId="settings-paytype-card">
        <Paragraph typography="st3" color={tdsColor.textSecondary}>
          급여 방식
        </Paragraph>
        <Spacing size={8} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Button
              display="block"
              variant={payType === "hourly" ? "fill" : "weak"}
              onClick={() => setPayType("hourly")}
            >
              시급
            </Button>
          </div>
          <div style={{ flex: 1 }}>
            <Button
              display="block"
              variant={payType === "salary" ? "fill" : "weak"}
              onClick={() => setPayType("salary")}
            >
              월급
            </Button>
          </div>
        </div>
      </Card>

      {payType === "hourly" ? (
        <Card testId="settings-hourly-card">
          <TextField
            variant="box"
            label="시급"
            placeholder="10,030"
            inputMode="numeric"
            suffix="원"
            value={hourlyWage}
            onChange={(event) => setHourlyWage(toDigits(event.target.value))}
            hasError={!hourlyWageCheck.valid}
            help={!hourlyWageCheck.valid ? hourlyWageCheck.message : undefined}
          />
        </Card>
      ) : (
        <Card testId="settings-salary-card">
          <TextField
            variant="box"
            label="월급"
            placeholder="3,200,000"
            inputMode="numeric"
            suffix="원"
            value={monthlySalary}
            onChange={(event) => setMonthlySalary(toDigits(event.target.value))}
            hasError={!monthlySalaryCheck.valid}
            help={!monthlySalaryCheck.valid ? monthlySalaryCheck.message : undefined}
          />
          <Spacing size={12} />
          <TextField
            variant="box"
            label="월 소정근로시간"
            placeholder="209"
            inputMode="numeric"
            suffix="시간"
            value={monthlyStandardHours}
            onChange={(event) => setMonthlyStandardHours(toDigits(event.target.value))}
            hasError={!monthlyStandardHoursCheck.valid}
            help={!monthlyStandardHoursCheck.valid ? monthlyStandardHoursCheck.message : undefined}
          />
        </Card>
      )}

      <Card testId="settings-break-card">
        <TextField
          variant="box"
          label="기본 휴게시간"
          placeholder="60"
          inputMode="numeric"
          suffix="분"
          value={breakMinutes}
          onChange={(event) => setBreakMinutes(toDigits(event.target.value))}
          hasError={!breakMinutesCheck.valid}
          help={!breakMinutesCheck.valid ? breakMinutesCheck.message : undefined}
        />
      </Card>

      <Card testId="settings-smallbiz-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Paragraph typography="st2" fontWeight="bold">
              5인 미만 사업장
            </Paragraph>
            <Spacing size={4} />
            <Paragraph typography="st4" color={tdsColor.textSecondary}>
              연장근무 가산수당(1.5배) 계산에서 제외돼요
            </Paragraph>
          </div>
          <Switch
            checked={isSmallBusiness}
            onChange={(_event, checked) => setIsSmallBusiness(checked)}
          />
        </div>
      </Card>
    </ScreenScaffold>
  );
}
